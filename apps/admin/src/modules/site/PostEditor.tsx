import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAdminContext, useEffectivePermissions } from "../../app/site-context/AdminContext";
import { useDirtyState } from "../../app/site-context/DirtyStateContext";
import { useAdminMutation, useAdminQuery } from "../../app/query-client/hooks";
import { useAdminTransport } from "../../app/query-client/AdminApiProvider";
import { AdminRequestError } from "../../app/query-client/apiState";
import { PageFrame } from "../PageFrame";
import { QueryState } from "../QueryStates";
import { asRecord, asRecords, arrayValue, formatDate, stringValue, type UnknownRecord } from "../recordUtils";
import { Alert, Button, Checkbox, ConflictPanel, FormSection, Modal, SelectField, StatusBadge, SuccessState, TextArea, TextField } from "../../ui/components";
import { InternalLinkSearchPanel, MediaPicker, RelatedCandidatePanel, RichTextRunsEditor, UrlHistoryPanel } from "./EditorAssist";

export const ARTICLE_BLOCK_TYPES = ["PARAGRAPH","HEADING","LIST","QUOTE","SEPARATOR","MEDIA","TABLE","EMBED","CALLOUT","CTA","DISCLAIMER","SOURCES_REFERENCES"] as const;
const BLOCK_LABELS:Record<BlockType,string>={PARAGRAPH:"Paragraph",HEADING:"Heading",LIST:"List",QUOTE:"Quote",SEPARATOR:"Separator",MEDIA:"Image",TABLE:"Table",EMBED:"Embed",CALLOUT:"Callout",CTA:"Button",DISCLAIMER:"Disclaimer",SOURCES_REFERENCES:"Sources and references"};
const STATIC_PAGE_KEYS = ["ABOUT","CONTACT","PRIVACY","TERMS","DISCLAIMER"] as const;
type BlockType = typeof ARTICLE_BLOCK_TYPES[number];
type Block = UnknownRecord & { block_id:string; type:BlockType };

function newBlockId(){return globalThis.crypto?.randomUUID?.() ?? `block-${Date.now()}-${Math.random().toString(36).slice(2)}`}
function editorInstanceIdFor(key:string){
  const storageKey=`bp:editor-instance:${key}`;
  try {
    const existing=globalThis.sessionStorage?.getItem(storageKey);
    if(existing)return existing;
    const created=globalThis.crypto?.randomUUID?.() ?? `editor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    globalThis.sessionStorage?.setItem(storageKey,created);
    return created;
  } catch {
    return globalThis.crypto?.randomUUID?.() ?? `editor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}
function rich(text=""){return {runs:[{text,marks:[]}]}}
function richText(value:unknown){const runs=Array.isArray(asRecord(value).runs)?asRecord(value).runs as unknown[]:[];return runs.map(run=>stringValue(asRecord(run),"text","")).join("")}
function splitRich(value:unknown,offset:number):[UnknownRecord,UnknownRecord]{
  const runs=asRecords(asRecord(value).runs);let cursor=0;const left:UnknownRecord[]=[];const right:UnknownRecord[]=[];
  for(const run of runs){
    const text=String(run.text??"");const end=cursor+text.length;
    if(end<=offset)left.push(run);
    else if(cursor>=offset)right.push(run);
    else{
      const cut=Math.max(0,Math.min(text.length,offset-cursor));
      if(cut>0)left.push({...run,text:text.slice(0,cut)});
      if(cut<text.length)right.push({...run,text:text.slice(cut)});
    }
    cursor=end;
  }
  return [{runs:left.length?left:[{text:"",marks:[]}]},{runs:right.length?right:[{text:"",marks:[]}]}];
}
function mergeRich(leftValue:unknown,rightValue:unknown):UnknownRecord{
  const left=asRecords(asRecord(leftValue).runs);const right=asRecords(asRecord(rightValue).runs);
  return {runs:[...left,...right].filter(run=>String(run.text??"").length>0).length?[...left,...right]:[{text:"",marks:[]}]};
}
function newBlock(type:BlockType):Block{const base={block_id:newBlockId(),type};switch(type){case"PARAGRAPH":return {...base,content:rich()};case"HEADING":return {...base,level:2,content:rich()};case"LIST":return {...base,style:"UNORDERED",items:[]};case"QUOTE":return {...base,quote:rich(),attribution:"",source:""};case"SEPARATOR":return base;case"MEDIA":return {...base,media_id:"",alt_override:"",caption:""};case"TABLE":return {...base,header_row:true,rows:[]};case"EMBED":return {...base,provider_key:"",source_url_or_id:"",caption:""};case"CALLOUT":return {...base,label:"",body:rich()};case"CTA":return {...base,label:"",supporting_text:"",destination:{kind:"EXTERNAL",url:""}};case"DISCLAIMER":return {...base,label:"",body:rich()};case"SOURCES_REFERENCES":return {...base,entries:[]};}}
function safeBlocks(value:unknown):Block[]{return Array.isArray(value)?value.filter((b):b is Block=>Boolean(b&&typeof b==="object"&&ARTICLE_BLOCK_TYPES.includes((b as Block).type))):[]}
function stripEmpty<T extends UnknownRecord>(record:T):T{const out:UnknownRecord={};for(const [k,v] of Object.entries(record)){if(v!==undefined&&v!==null&&v!=="")out[k]=v}return out as T}
function blockDefaults(type:BlockType):UnknownRecord{
  if(type==="LIST")return {style:"UNORDERED",items:[rich("")]};
  if(type==="TABLE")return {rows:[[rich(""),rich("")],[rich(""),rich("")]]};
  return {};
}
function BlockInsertMenu({label="+",onInsert}:{label?:string;onInsert(type:BlockType,overrides?:UnknownRecord):void}){
  const [open,setOpen]=useState(false);const [query,setQuery]=useState("");
  const choices=ARTICLE_BLOCK_TYPES.filter(type=>BLOCK_LABELS[type].toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="bp-wp-inserter">
    <Button type="button" variant="tertiary" onClick={()=>setOpen(value=>!value)} aria-expanded={open} aria-label={label==="+"?"Add block":label}>{label}</Button>
    {open?<div className="bp-wp-inserter-popover" role="dialog" aria-label="Add block">
      <input className="bp-input" aria-label="Search blocks" placeholder="Search blocks" value={query} onChange={event=>setQuery(event.target.value)} autoFocus/>
      <div className="bp-wp-inserter-grid">{choices.map(type=><button type="button" key={type} onClick={()=>{onInsert(type,blockDefaults(type));setOpen(false);setQuery("")}}><strong>{BLOCK_LABELS[type]}</strong><span>{type==="PARAGRAPH"?"Start writing":type==="HEADING"?"Heading H2/H3/H4":type==="LIST"?"Bulleted or numbered list":type==="MEDIA"?"Upload or choose an image":type==="CTA"?"Call-to-action button":"Insert content block"}</span></button>)}</div>
    </div>:null}
  </div>;
}

function tableRows(block:Block):UnknownRecord[][]{
  const rows=Array.isArray(block.rows)?block.rows.filter(Array.isArray).map(row=>(row as unknown[]).map(cell=>asRecord(cell))):[];
  return rows.length?rows:[[rich(""),rich("")],[rich(""),rich("")]];
}
function listRichItems(block:Block):UnknownRecord[]{const items=Array.isArray(block.items)?block.items.map(item=>asRecord(item)):[];return items.length?items:[rich("")]}

function BlockEditor({
  siteKey,block,index,count,active,onChange,onMove,onRemove,onDuplicate,onSplit,onMergePrevious,onExitList,onFocus,onUndo,onRedo,onSlashCommand,onDragStart,onDrop,
}:{
  siteKey:string;block:Block;index:number;count:number;active:boolean;onChange(block:Block):void;onMove(delta:number):void;onRemove():void;onDuplicate():void;
  onSplit(offset:number):void;onMergePrevious():boolean;onExitList(itemIndex:number):void;onFocus():void;onUndo():void;onRedo():void;onSlashCommand(command:string):boolean;onDragStart():void;onDrop():void;
}){
  const field=(key:string,value:string)=>onChange({...block,[key]:value});
  const type=block.type;
  const destination=asRecord(block.destination);
  const destinationKind=stringValue(destination,"kind","EXTERNAL");
  const destinationTargetType=stringValue(destination,"target_type","ARTICLE");
  const naturalWriting=type==="PARAGRAPH"||type==="HEADING";
  const headingLevel=Number(block.level??2);
  const items=listRichItems(block);
  const rows=tableRows(block);
  const updateListItem=(itemIndex:number,value:UnknownRecord)=>onChange({...block,items:items.map((item,i)=>i===itemIndex?value:item)});
  const focusListItem=(itemIndex:number)=>requestAnimationFrame(()=>document.getElementById(`bp-list-${block.block_id}-${itemIndex}`)?.focus());
  const addListItemAfter=(itemIndex:number)=>{const next=[...items];next.splice(itemIndex+1,0,rich(""));onChange({...block,items:next});focusListItem(itemIndex+1)};
  const removeListItem=(itemIndex:number)=>{
    if(items.length<=1){onChange({...newBlock("PARAGRAPH"),block_id:block.block_id});requestAnimationFrame(()=>document.getElementById(`bp-writer-${block.block_id}`)?.focus());return;}
    onChange({...block,items:items.filter((_,i)=>i!==itemIndex)});focusListItem(Math.max(0,itemIndex-1));
  };
  const updateCell=(rowIndex:number,columnIndex:number,value:string)=>onChange({...block,rows:rows.map((row,r)=>r===rowIndex?row.map((cell,col)=>col===columnIndex?rich(value):cell):row)});
  const columnCount=Math.max(1,...rows.map(row=>row.length));
  const addRow=()=>onChange({...block,rows:[...rows,Array.from({length:columnCount},()=>rich(""))]});
  const addColumn=()=>onChange({...block,rows:rows.map(row=>[...row,rich("")])});
  const removeRow=()=>{if(rows.length<=1)return;onChange({...block,rows:rows.slice(0,-1)})};
  const removeColumn=()=>{if(columnCount<=1)return;onChange({...block,rows:rows.map(row=>row.slice(0,-1))})};

  return <article className={`bp-block-frame${naturalWriting?" bp-writing-block":" bp-content-block"} bp-block-${type.toLowerCase()}${active?" is-active":""}`} data-block-id={block.block_id} aria-label={`${BLOCK_LABELS[type]} block ${index+1}`} onFocus={onFocus} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();onDrop()}}>
    <header className={`bp-block-header${naturalWriting?" bp-block-header--writing":""}`} aria-label={`${BLOCK_LABELS[type]} block toolbar`}>
      <div className="bp-block-context">
        <button className="bp-drag-handle" type="button" draggable onDragStart={event=>{event.dataTransfer.effectAllowed="move";onDragStart()}} aria-label={`Drag ${BLOCK_LABELS[type]}`}>⋮⋮</button>
        {naturalWriting?null:type==="LIST"?<div className="bp-list-toggle" role="group" aria-label="List style"><Button type="button" variant={String(block.style??"UNORDERED")==="UNORDERED"?"secondary":"tertiary"} onClick={()=>onChange({...block,style:"UNORDERED"})}>Bullets</Button><Button type="button" variant={String(block.style??"UNORDERED")==="ORDERED"?"secondary":"tertiary"} onClick={()=>onChange({...block,style:"ORDERED"})}>Numbers</Button></div>:<span className="bp-block-type">{BLOCK_LABELS[type]}</span>}
      </div>
      <div className="bp-block-actions"><Button variant="tertiary" type="button" onClick={()=>onMove(-1)} disabled={index===0} aria-label={`Move ${BLOCK_LABELS[type]} up`}>↑</Button><Button variant="tertiary" type="button" onClick={()=>onMove(1)} disabled={index===count-1} aria-label={`Move ${BLOCK_LABELS[type]} down`}>↓</Button><Button variant="tertiary" type="button" onClick={onDuplicate}>Duplicate</Button><Button variant="tertiary" type="button" onClick={onRemove} aria-label={`Remove ${BLOCK_LABELS[type]}`}>Remove</Button></div>
    </header>
    {type==="PARAGRAPH"?<RichTextRunsEditor siteKey={siteKey} editorId={`bp-writer-${block.block_id}`} label="Paragraph" variant="paragraph" placeholder="Start writing or type / for a quick block…" value={block.content} onChange={value=>onChange({...block,content:value})} multiline showToolbar={false} onEnter={onSplit} onBackspaceAtStart={onMergePrevious} onFocus={onFocus} onUndo={onUndo} onRedo={onRedo} onSlashCommand={onSlashCommand}/>:null}
    {type==="HEADING"?<RichTextRunsEditor siteKey={siteKey} editorId={`bp-writer-${block.block_id}`} label={`Heading H${headingLevel}`} variant={headingLevel===3?"heading3":headingLevel===4?"heading4":"heading2"} placeholder="Add heading" value={block.content} onChange={value=>onChange({...block,content:value})} showToolbar={false} onEnter={onSplit} onBackspaceAtStart={onMergePrevious} onFocus={onFocus} onUndo={onUndo} onRedo={onRedo}/>:null}
    {type==="LIST"?<div className="bp-list-editor"><div className="bp-list-style-label">{String(block.style??"UNORDERED")==="ORDERED"?"Numbered list":"Bulleted list"}</div>{String(block.style??"UNORDERED")==="ORDERED"?<ol>{items.map((item,itemIndex)=><li key={itemIndex}><RichTextRunsEditor siteKey={siteKey} editorId={`bp-list-${block.block_id}-${itemIndex}`} label={`List item ${itemIndex+1}`} value={item} onChange={value=>updateListItem(itemIndex,value)} placeholder="List item" showToolbar={false} onFocus={onFocus} onUndo={onUndo} onRedo={onRedo} onEnter={()=>{if(!richText(item).trim()&&itemIndex===items.length-1){onExitList(itemIndex)}else addListItemAfter(itemIndex)}} onBackspaceAtStart={()=>{if(!richText(item).trim()){removeListItem(itemIndex);return true}return false}}/></li>)}</ol>:<ul>{items.map((item,itemIndex)=><li key={itemIndex}><RichTextRunsEditor siteKey={siteKey} editorId={`bp-list-${block.block_id}-${itemIndex}`} label={`List item ${itemIndex+1}`} value={item} onChange={value=>updateListItem(itemIndex,value)} placeholder="List item" showToolbar={false} onFocus={onFocus} onUndo={onUndo} onRedo={onRedo} onEnter={()=>{if(!richText(item).trim()&&itemIndex===items.length-1){onExitList(itemIndex)}else addListItemAfter(itemIndex)}} onBackspaceAtStart={()=>{if(!richText(item).trim()){removeListItem(itemIndex);return true}return false}}/></li>)}</ul>}</div>:null}
    {type==="QUOTE"?<div className="bp-quote-editor"><RichTextRunsEditor siteKey={siteKey} editorId={`bp-quote-${block.block_id}`} label="Quote" variant="quote" placeholder="Write the quote…" value={block.quote} onChange={value=>onChange({...block,quote:value})} multiline showToolbar={false} onFocus={onFocus} onUndo={onUndo} onRedo={onRedo}/><details className="bp-inline-details"><summary>Add citation</summary><div className="bp-form-stack"><TextField label="Attribution" value={String(block.attribution??"")} onChange={e=>field("attribution",e.target.value)}/><TextField label="Source" value={String(block.source??"")} onChange={e=>field("source",e.target.value)}/></div></details></div>:null}
    {type==="SEPARATOR"?<div className="bp-separator-preview" aria-label="Divider"><hr/></div>:null}
    {type==="MEDIA"?<div className="bp-article-image-editor"><MediaPicker siteKey={siteKey} value={String(block.media_id??"")} onSelect={mediaId=>field("media_id",mediaId)} label="Upload or choose image" preview="article"/><details className="bp-inline-details"><summary>Image details</summary><div className="bp-form-stack"><TextField label="Alternative text" value={String(block.alt_override??"")} onChange={e=>field("alt_override",e.target.value)} hint="Describe the image for readers who cannot see it."/><TextArea label="Caption" value={String(block.caption??"")} onChange={e=>field("caption",e.target.value)}/></div></details></div>:null}
    {type==="TABLE"?<div className="bp-table-editor"><div className="bp-table-editor-grid">{rows.map((row,rowIndex)=><div className="bp-table-editor-row" key={rowIndex}>{Array.from({length:columnCount},(_,columnIndex)=><input key={columnIndex} className="bp-table-editor-cell" aria-label={`Row ${rowIndex+1}, column ${columnIndex+1}`} value={richText(row[columnIndex]??rich(""))} onChange={e=>updateCell(rowIndex,columnIndex,e.target.value)}/>)}</div>)}</div><div className="bp-inline-actions"><Button type="button" variant="tertiary" onClick={addRow}>Add row</Button><Button type="button" variant="tertiary" onClick={addColumn}>Add column</Button><Button type="button" variant="tertiary" onClick={removeRow} disabled={rows.length<=1}>Remove row</Button><Button type="button" variant="tertiary" onClick={removeColumn} disabled={columnCount<=1}>Remove column</Button></div><Checkbox label="First row is a heading row" checked={Boolean(block.header_row)} onChange={e=>onChange({...block,header_row:e.target.checked})}/></div>:null}
    {type==="EMBED"?<div className="bp-embed-editor"><TextField label="Embed URL or ID" value={String(block.source_url_or_id??"")} onChange={e=>field("source_url_or_id",e.target.value)} placeholder="Paste the approved embed URL"/><TextField label="Caption" value={String(block.caption??"")} onChange={e=>field("caption",e.target.value)}/><details className="bp-inline-details"><summary>Advanced provider settings</summary><TextField label="Provider key" value={String(block.provider_key??"")} onChange={e=>field("provider_key",e.target.value)} hint="Only approved providers can be published."/></details></div>:null}
    {type==="CALLOUT"?<div className="bp-editorial-callout"><TextField label="Callout label" value={String(block.label??"")} onChange={e=>field("label",e.target.value)} placeholder="Optional label"/><RichTextRunsEditor siteKey={siteKey} editorId={`bp-callout-${block.block_id}`} label="Callout body" value={block.body} onChange={value=>onChange({...block,body:value})} multiline showToolbar={false} onFocus={onFocus} onUndo={onUndo} onRedo={onRedo}/></div>:null}
    {type==="CTA"?<div className="bp-cta-editor"><TextField label="Supporting text" value={String(block.supporting_text??"")} onChange={e=>field("supporting_text",e.target.value)} placeholder="Optional supporting text"/><div className="bp-cta-button-preview">{String(block.label??"")||"Button text"}</div><TextField label="Button label" value={String(block.label??"")} onChange={e=>field("label",e.target.value)} required/><details className="bp-inline-details"><summary>Button link</summary><div className="bp-form-stack"><SelectField label="Link type" value={destinationKind} onChange={e=>onChange({...block,destination:e.target.value==="EXTERNAL"?{kind:"EXTERNAL",url:""}:{kind:"INTERNAL",target_type:"ARTICLE",target_id:""}})}><option value="EXTERNAL">Web address</option><option value="INTERNAL">This website</option></SelectField>{destinationKind==="EXTERNAL"?<TextField label="Web address" type="url" value={stringValue(destination,"url","")==="—"?"":stringValue(destination,"url","")} onChange={e=>onChange({...block,destination:{kind:"EXTERNAL",url:e.target.value}})} required/>:<><p className="bp-field-hint">{destinationTargetType==="STATIC"?"A website page is selected.":stringValue(destination,"target_id","")&&stringValue(destination,"target_id","")!=="—"?"An internal destination is selected.":"Search and choose an internal destination below."}</p><InternalLinkSearchPanel siteKey={siteKey} onUse={candidate=>{const kind=stringValue(candidate,"kind","ARTICLE");if(kind==="STATIC"){const staticPageKey=stringValue(candidate,"static_page_key","");if(staticPageKey&&STATIC_PAGE_KEYS.includes(staticPageKey as typeof STATIC_PAGE_KEYS[number]))onChange({...block,destination:{kind:"INTERNAL",target_type:"STATIC",static_page_key:staticPageKey}});return;}const resourceId=stringValue(candidate,"resource_id","");if(resourceId)onChange({...block,destination:{kind:"INTERNAL",target_type:kind,target_id:resourceId}})}}/></>}</div></details></div>:null}
    {type==="DISCLAIMER"?<div className="bp-editorial-disclaimer"><TextField label="Disclaimer label" value={String(block.label??"")} onChange={e=>field("label",e.target.value)} placeholder="Disclaimer"/><RichTextRunsEditor siteKey={siteKey} editorId={`bp-disclaimer-${block.block_id}`} label="Disclaimer body" value={block.body} onChange={value=>onChange({...block,body:value})} multiline showToolbar={false} onFocus={onFocus} onUndo={onUndo} onRedo={onRedo}/></div>:null}
    {type==="SOURCES_REFERENCES"?<div className="bp-sources-editor"><strong>Sources & References</strong><TextArea label="Sources / References" hint="One source per line: Title | URL | Publisher | Note" value={(Array.isArray(block.entries)?block.entries:[]).map((entry)=>{const r=asRecord(entry);return [r.title,r.url,r.publisher,r.note].map(v=>String(v??"")).join(" | ")}).join("\n")} onChange={e=>onChange({...block,entries:e.target.value.split("\n").filter(Boolean).map(line=>{const [title,url,publisher,note]=line.split("|").map(v=>v.trim());return stripEmpty({title:title??"",url,publisher,note})})})}/></div>:null}
  </article>
}

interface EditorModel {title:string;excerpt:string;blocks:Block[];slug:string;author:string;categories:string;tags:string;featuredMedia:string;related:string;seoTitle:string;metaDescription:string;canonical:string;indexPolicy:string;robots:string;ogTitle:string;ogDescription:string;ogImage:string;breadcrumbLabel:string}
const EMPTY:EditorModel={title:"",excerpt:"",blocks:[newBlock("PARAGRAPH")],slug:"",author:"",categories:"",tags:"",featuredMedia:"",related:"",seoTitle:"",metaDescription:"",canonical:"",indexPolicy:"INHERIT",robots:"INHERIT",ogTitle:"",ogDescription:"",ogImage:"",breadcrumbLabel:""};
function modelFromPost(post:UnknownRecord):EditorModel{
  const body=asRecord(post.body);const blocks=safeBlocks(body.blocks);
  return {title:stringValue(post,"title","")==="—"?"":stringValue(post,"title",""),excerpt:stringValue(post,"excerpt","")==="—"?"":stringValue(post,"excerpt",""),blocks:blocks.length?blocks:[newBlock("PARAGRAPH")],slug:stringValue(post,"slug","")==="—"?"":stringValue(post,"slug",""),author:stringValue(post,"author_site_profile_id","")==="—"?"":stringValue(post,"author_site_profile_id",""),categories:arrayValue(post,"category_ids").join(", "),tags:arrayValue(post,"tag_ids").join(", "),featuredMedia:stringValue(post,"featured_media_id","")==="—"?"":stringValue(post,"featured_media_id",""),related:arrayValue(post,"manual_related_post_ids").join(", "),seoTitle:stringValue(post,"seo_title","")==="—"?"":stringValue(post,"seo_title",""),metaDescription:stringValue(post,"meta_description","")==="—"?"":stringValue(post,"meta_description",""),canonical:stringValue(post,"canonical_override","")==="—"?"":stringValue(post,"canonical_override",""),indexPolicy:stringValue(post,"index_policy","INHERIT"),robots:stringValue(post,"link_robots_policy","INHERIT"),ogTitle:stringValue(post,"og_title","")==="—"?"":stringValue(post,"og_title",""),ogDescription:stringValue(post,"og_description","")==="—"?"":stringValue(post,"og_description",""),ogImage:stringValue(post,"og_image_media_id","")==="—"?"":stringValue(post,"og_image_media_id",""),breadcrumbLabel:stringValue(post,"breadcrumb_label","")==="—"?"":stringValue(post,"breadcrumb_label","")};
}
function ids(text:string){return text.split(",").map(v=>v.trim()).filter(Boolean)}
function destinationReady(value:unknown):boolean{
  const destination=asRecord(value);const kind=stringValue(destination,"kind","");
  if(kind==="EXTERNAL"){const url=stringValue(destination,"url","");try{const parsed=new URL(url);return parsed.protocol==="http:"||parsed.protocol==="https:"}catch{return false}}
  if(kind!=="INTERNAL")return false;
  const targetType=stringValue(destination,"target_type","");
  return targetType==="STATIC"?Boolean(stringValue(destination,"static_page_key","")):Boolean(targetType&&stringValue(destination,"target_id",""));
}
export function persistableArticleBlocks(blocks:Block[]):Block[]{
  const out:Block[]=[];
  for(const block of blocks){
    if(block.type==="PARAGRAPH"||block.type==="HEADING"){if(richText(block.content).trim())out.push(block);continue}
    if(block.type==="LIST"){const items=listRichItems(block).filter(item=>richText(item).trim());if(items.length)out.push({...block,items});continue}
    if(block.type==="QUOTE"){if(richText(block.quote).trim())out.push(block);continue}
    if(block.type==="MEDIA"){if(String(block.media_id??"").trim())out.push(block);continue}
    if(block.type==="CALLOUT"||block.type==="DISCLAIMER"){if(richText(block.body).trim())out.push(block);continue}
    if(block.type==="CTA"){if(String(block.label??"").trim()&&destinationReady(block.destination))out.push(block);continue}
    if(block.type==="SOURCES_REFERENCES"){const entries=Array.isArray(block.entries)?block.entries.filter(entry=>String(asRecord(entry).title??"").trim()):[];if(entries.length)out.push({...block,entries});continue}
    if(block.type==="EMBED"){if(String(block.provider_key??"").trim()&&String(block.source_url_or_id??"").trim())out.push(block);continue}
    if(block.type==="TABLE"){const rows=Array.isArray(block.rows)?block.rows.filter(Array.isArray):[];if(rows.length&&rows[0]?.length)out.push(block);continue}
    out.push(block);
  }
  return out;
}
function createBody(model:EditorModel,includeTags=true):UnknownRecord{return stripEmpty({title:model.title||undefined,excerpt:model.excerpt||undefined,body:{content_schema_version:"1",blocks:persistableArticleBlocks(model.blocks)},category_ids:ids(model.categories),...(includeTags?{tag_ids:ids(model.tags)}:{}),featured_media_id:model.featuredMedia||undefined,manual_related_post_ids:ids(model.related),slug:model.slug||undefined,seo_title:model.seoTitle||undefined,meta_description:model.metaDescription||undefined,canonical_override:model.canonical||undefined,index_policy:model.indexPolicy,link_robots_policy:model.robots,og_title:model.ogTitle||undefined,og_description:model.ogDescription||undefined,author_site_profile_id:model.author||undefined,og_image_media_id:model.ogImage||undefined,breadcrumb_label:model.breadcrumbLabel||undefined});}
function hasMeaningfulBody(blocks:Block[]):boolean{
  return blocks.some(block=>{
    if(block.type==="PARAGRAPH"||block.type==="HEADING")return Boolean(richText(block.content).trim());
    if(block.type==="QUOTE")return Boolean(richText(block.quote).trim());
    if(block.type==="LIST")return (Array.isArray(block.items)?block.items:[]).some(item=>Boolean(richText(item).trim()));
    if(block.type==="MEDIA")return Boolean(String(block.media_id??"").trim());
    if(block.type==="TABLE")return (Array.isArray(block.rows)?block.rows:[]).some(row=>Array.isArray(row)&&row.some(cell=>Boolean(richText(cell).trim())));
    if(block.type==="SEPARATOR")return false;
    return true;
  });
}
function hasMeaningfulDraft(model:EditorModel):boolean{return Boolean(model.title.trim()||model.excerpt.trim()||hasMeaningfulBody(model.blocks))}
function postSlug(post:UnknownRecord,fallback:string):string{const value=stringValue(post,"slug","");return value&&value!=="—"?value:fallback}

function AutosaveIndicator({state,time,onRetry}:{state:"clean"|"unsaved"|"saving"|"saved"|"error";time?:string;onRetry():void}){if(state==="clean")return null;return <span className={`bp-autosave${state==="error"?" bp-autosave--error":""}`} aria-live="polite">{state==="unsaved"?"Unsaved changes":state==="saving"?"Saving...":state==="saved"?`Saved${time?` ${time}`:""}`:<><span>Autosave failed.</span><Button type="button" variant="tertiary" onClick={onRetry}>Retry</Button></>}</span>}

export function PostEditorPage({mode}:{mode:"create"|"edit"}){
  const site=useAdminContext().site!;
  const permissions=useEffectivePermissions();
  const {postId=""}=useParams();
  const navigate=useNavigate();
  const dirtyState=useDirtyState();
  const transport=useAdminTransport();
  const editorInstanceId=useMemo(()=>editorInstanceIdFor(`${site.site_key}:${postId||"new"}`),[site.site_key,postId]);
  const postQuery=useAdminQuery<UnknownRecord>("API15-S-012",{path:{site_key:site.site_key,post_id:postId}},mode==="edit");
  const authorsQuery=useAdminQuery<UnknownRecord>("API15-S-050",{path:{site_key:site.site_key},query:{page:1,page_size:100}},permissions.includes("authors.view"));
  const categoriesQuery=useAdminQuery<UnknownRecord>("API15-S-030",{path:{site_key:site.site_key},query:{page:1,page_size:100}},permissions.includes("categories.view"));
  const autosaveQuery=useAdminQuery<UnknownRecord>("API15-S-015",{path:{site_key:site.site_key,post_id:postId},query:{editor_instance_id:editorInstanceId}},mode==="edit");
  const post=asRecord(asRecord(postQuery.data).post);
  const [model,setModel]=useState<EditorModel>(EMPTY);
  const [serverVersion,setServerVersion]=useState(1);
  const [status,setStatus]=useState("DRAFT");
  const [autosaveState,setAutosaveState]=useState<"clean"|"unsaved"|"saving"|"saved"|"error">("clean");
  const [autosaveTime,setAutosaveTime]=useState<string>();
  const hydrated=useRef(false);
  const modelRef=useRef<EditorModel>(model);
  const serverVersionRef=useRef(serverVersion);
  const editRevisionRef=useRef(0);
  const lastAutosavedRevisionRef=useRef(0);
  const historyRef=useRef<{past:EditorModel[];future:EditorModel[]}>({past:[],future:[]});
  const [historyState,setHistoryState]=useState({canUndo:false,canRedo:false});
  const [activeBlockId,setActiveBlockId]=useState<string>();
  const [activeEditorId,setActiveEditorId]=useState<string>();
  const [draggedBlockId,setDraggedBlockId]=useState<string>();
  const [settingsOpen,setSettingsOpen]=useState(true);
  const [settingsTab,setSettingsTab]=useState<"post"|"block">("post");
  const createMutation=useAdminMutation<UnknownRecord>("API15-S-011");
  const saveMutation=useAdminMutation<UnknownRecord>("API15-S-013");
  const autosaveMutation=useAdminMutation<UnknownRecord>("API15-S-014");
  const previewMutation=useAdminMutation<UnknownRecord>("API15-S-016");
  const scheduleMutation=useAdminMutation<UnknownRecord>("API15-S-017");
  const unscheduleMutation=useAdminMutation<UnknownRecord>("API15-S-018");
  const publishMutation=useAdminMutation<UnknownRecord>("API15-S-019");
  const archiveMutation=useAdminMutation<UnknownRecord>("API15-S-020");
  const trashMutation=useAdminMutation<UnknownRecord>("API15-S-021");
  const restoreMutation=useAdminMutation<UnknownRecord>("API15-S-022");
  const deleteMutation=useAdminMutation("API15-S-023");
  const duplicateMutation=useAdminMutation<UnknownRecord>("API15-S-024");
  const [scheduleOpen,setScheduleOpen]=useState(false);
  const [scheduleLocal,setScheduleLocal]=useState("");
  const scheduleTz=site.timezone_id??"Asia/Kolkata";
  const [publishReviewOpen,setPublishReviewOpen]=useState(false);
  const [confirmAction,setConfirmAction]=useState<"archive"|"trash"|"restore"|"delete"|undefined>();
  const [recoverOpen,setRecoverOpen]=useState(false);
  const [success,setSuccess]=useState<string>();
  const [openingPublic,setOpeningPublic]=useState(false);
  const anyError=createMutation.error??saveMutation.error??previewMutation.error??scheduleMutation.error??publishMutation.error??archiveMutation.error??trashMutation.error??restoreMutation.error??deleteMutation.error??duplicateMutation.error;
  const conflict=anyError instanceof AdminRequestError&&anyError.failure.uiState==="CONFLICT";

  useEffect(()=>{modelRef.current=model},[model]);
  useEffect(()=>{serverVersionRef.current=serverVersion},[serverVersion]);

  useEffect(()=>{
    if(mode==="edit"&&postQuery.data&&!hydrated.current){
      const hydratedModel=modelFromPost(post);const hydratedVersion=Number(post.version??1);
      setModel(hydratedModel);modelRef.current=hydratedModel;setServerVersion(hydratedVersion);serverVersionRef.current=hydratedVersion;setStatus(stringValue(post,"status","DRAFT"));
      editRevisionRef.current=0;lastAutosavedRevisionRef.current=0;historyRef.current={past:[],future:[]};setHistoryState({canUndo:false,canRedo:false});dirtyState.setDirty(false);hydrated.current=true;
    }
    if(mode==="create"&&!hydrated.current){
      const initialModel={...EMPTY,blocks:[newBlock("PARAGRAPH")]};setModel(initialModel);modelRef.current=initialModel;setStatus("DRAFT");setServerVersion(1);serverVersionRef.current=1;
      editRevisionRef.current=0;lastAutosavedRevisionRef.current=0;historyRef.current={past:[],future:[]};setHistoryState({canUndo:false,canRedo:false});hydrated.current=true;dirtyState.setDirty(false);
    }
  },[mode,postQuery.data]);

  useEffect(()=>{
    if(mode!=="edit"||!autosaveQuery.data||!postQuery.data||dirtyState.dirty)return;
    const auto=asRecord(autosaveQuery.data);
    const savedAt=new Date(stringValue(auto,"saved_at","1970-01-01T00:00:00Z"));
    const updatedAt=new Date(stringValue(post,"updated_at","1970-01-01T00:00:00Z"));
    if(savedAt>updatedAt&&Number(auto.base_version)===Number(post.version))setRecoverOpen(true);
  },[autosaveQuery.data,postQuery.data]);

  useEffect(()=>{
    if(mode!=="create"||!dirtyState.dirty||!hasMeaningfulDraft(model)||createMutation.isPending)return;
    const timer=window.setTimeout(()=>void createInitialDraft(false),2500);
    return()=>window.clearTimeout(timer);
  },[mode,dirtyState.dirty,model,createMutation.isPending]);

  useEffect(()=>{
    if(mode!=="edit"||!dirtyState.dirty||editRevisionRef.current<=lastAutosavedRevisionRef.current||!permissions.includes("posts.edit")||autosaveMutation.isPending)return;
    const timer=window.setTimeout(()=>void autosaveNow(),4000);
    return()=>window.clearTimeout(timer);
  },[mode,dirtyState.dirty,model,serverVersion,postId,site.site_key,editorInstanceId,permissions,autosaveMutation.isPending]);

  function markEdited(){editRevisionRef.current+=1;dirtyState.setDirty(true);dirtyState.setDirtyLabel("post editor changes");setSuccess(undefined);setAutosaveState("unsaved");return editRevisionRef.current}
  function commitModel(change:(current:EditorModel)=>EditorModel){
    markEdited();
    setModel(current=>{
      const next=change(current);modelRef.current=next;
      historyRef.current.past=[...historyRef.current.past,current].slice(-100);
      historyRef.current.future=[];
      setHistoryState({canUndo:true,canRedo:false});
      return next;
    });
  }
  function update<K extends keyof EditorModel>(key:K,value:EditorModel[K]){commitModel(current=>({...current,[key]:value}))}
  function undoEditor(){
    if(!historyRef.current.past.length)return;
    markEdited();
    setModel(current=>{
      const previous=historyRef.current.past.pop();
      if(!previous)return current;
      historyRef.current.future=[current,...historyRef.current.future].slice(0,100);
      modelRef.current=previous;setHistoryState({canUndo:historyRef.current.past.length>0,canRedo:true});
      return previous;
    });
  }
  function redoEditor(){
    if(!historyRef.current.future.length)return;
    markEdited();
    setModel(current=>{
      const next=historyRef.current.future.shift();
      if(!next)return current;
      historyRef.current.past=[...historyRef.current.past,current].slice(-100);
      modelRef.current=next;setHistoryState({canUndo:true,canRedo:historyRef.current.future.length>0});
      return next;
    });
  }
  function replaceBlock(blockId:string,next:Block){commitModel(current=>({...current,blocks:current.blocks.map(block=>block.block_id===blockId?next:block)}))}
  function transformTextBlock(blockId:string,target:"PARAGRAPH"|"H2"|"H3"|"H4"){
    commitModel(current=>({...current,blocks:current.blocks.map(block=>{
      if(block.block_id!==blockId||(block.type!=="PARAGRAPH"&&block.type!=="HEADING"))return block;
      if(target==="PARAGRAPH")return {...newBlock("PARAGRAPH"),block_id:block.block_id,content:block.content} as Block;
      return {...newBlock("HEADING"),block_id:block.block_id,level:Number(target.slice(1)),content:block.content} as Block;
    })}));
    setActiveBlockId(blockId);focusWriter(blockId);
  }
  function duplicateBlock(blockId:string){
    const copyId=newBlockId();
    commitModel(current=>{const index=current.blocks.findIndex(block=>block.block_id===blockId);if(index<0)return current;const source=current.blocks[index]!;const copy={...source,block_id:copyId} as Block;const next=[...current.blocks];next.splice(index+1,0,copy);return {...current,blocks:next}});
    setActiveBlockId(copyId);
  }
  function reorderBlock(sourceId:string,targetId:string){
    if(sourceId===targetId)return;
    commitModel(current=>{const next=[...current.blocks];const sourceIndex=next.findIndex(block=>block.block_id===sourceId);const targetIndex=next.findIndex(block=>block.block_id===targetId);if(sourceIndex<0||targetIndex<0)return current;const [source]=next.splice(sourceIndex,1);if(!source)return current;const insertAt=sourceIndex<targetIndex?targetIndex-1:targetIndex;next.splice(insertAt,0,source);return {...current,blocks:next}});
    setActiveBlockId(sourceId);
  }
  function focusWriter(blockId:string,atEnd=false){requestAnimationFrame(()=>{const el=document.getElementById(`bp-writer-${blockId}`);if(!(el instanceof HTMLElement))return;el.focus();const range=document.createRange();range.selectNodeContents(el);range.collapse(!atEnd);const selection=window.getSelection();selection?.removeAllRanges();selection?.addRange(range)})}
  function moveBlock(blockId:string,delta:number){
    commitModel(current=>{const next=[...current.blocks];const index=next.findIndex(block=>block.block_id===blockId);const target=index+delta;if(index<0||target<0||target>=next.length)return current;[next[index],next[target]]=[next[target]!,next[index]!];return {...current,blocks:next}});
  }
  function removeBlock(blockId:string){commitModel(current=>{const next=current.blocks.filter(block=>block.block_id!==blockId);return {...current,blocks:next.length?next:[newBlock("PARAGRAPH")]}})}
  function insertBlockAt(insertAt:number,type:BlockType,overrides:UnknownRecord={}){
    const block={...newBlock(type),...blockDefaults(type),...overrides} as Block;
    commitModel(current=>{const next=[...current.blocks];next.splice(Math.max(0,Math.min(insertAt,next.length)),0,block);return {...current,blocks:next}});
    setActiveBlockId(block.block_id);if(type==="PARAGRAPH"||type==="HEADING")focusWriter(block.block_id);
  }
  function insertBlock(type:BlockType,overrides:UnknownRecord={}){
    const activeIndex=modelRef.current.blocks.findIndex(item=>item.block_id===activeBlockId);
    insertBlockAt(activeIndex>=0?activeIndex+1:modelRef.current.blocks.length,type,overrides);
  }
  function splitBlock(blockId:string,offset:number){
    const source=model.blocks.find(block=>block.block_id===blockId);
    if(!source||(source.type!=="PARAGRAPH"&&source.type!=="HEADING"))return;
    const nextBlock={...newBlock("PARAGRAPH")} as Block;
    commitModel(current=>{const index=current.blocks.findIndex(block=>block.block_id===blockId);const block=current.blocks[index];if(index<0||!block||(block.type!=="PARAGRAPH"&&block.type!=="HEADING"))return current;const [before,after]=splitRich(block.content,offset);nextBlock.content=after;const next=[...current.blocks];next.splice(index,1,{...block,content:before},nextBlock);return {...current,blocks:next}});
    setActiveBlockId(nextBlock.block_id);focusWriter(nextBlock.block_id);
  }
  function mergePrevious(blockId:string):boolean{
    const index=model.blocks.findIndex(block=>block.block_id===blockId);
    if(index<=0)return false;
    const currentBlock=model.blocks[index];const previous=model.blocks[index-1];
    if(!currentBlock||!previous||(currentBlock.type!=="PARAGRAPH"&&currentBlock.type!=="HEADING")||(previous.type!=="PARAGRAPH"&&previous.type!=="HEADING"))return false;
    const currentText=richText(currentBlock.content);
    if(currentText.length>0&&currentBlock.type!==previous.type)return false;
    commitModel(current=>{const next=[...current.blocks];const liveIndex=next.findIndex(block=>block.block_id===blockId);if(liveIndex<=0)return current;const live=next[liveIndex]!;const before=next[liveIndex-1]!;if(!richText(live.content)){next.splice(liveIndex,1);return {...current,blocks:next}};next.splice(liveIndex-1,2,{...before,content:mergeRich(before.content,live.content)});return {...current,blocks:next}});
    setActiveBlockId(previous.block_id);focusWriter(previous.block_id,true);return true;
  }
  function insertParagraphOrConvert(){
    const active=modelRef.current.blocks.find(block=>block.block_id===activeBlockId);
    if(active?.type==="PARAGRAPH"){focusWriter(active.block_id);return}
    if(active?.type==="HEADING"){const converted={...newBlock("PARAGRAPH"),block_id:active.block_id,content:active.content} as Block;replaceBlock(active.block_id,converted);setActiveBlockId(active.block_id);focusWriter(active.block_id);return}
    insertBlock("PARAGRAPH");
  }
  function applyToolbarTextType(target:"PARAGRAPH"|"H2"|"H3"|"H4"){
    const active=modelRef.current.blocks.find(block=>block.block_id===activeBlockId);
    if(active?.type==="PARAGRAPH"||active?.type==="HEADING"){transformTextBlock(active.block_id,target);return}
    if(target==="PARAGRAPH")insertBlock("PARAGRAPH");
    else insertBlock("HEADING",{level:Number(target.slice(1))});
  }
  function convertActiveToList(style:"UNORDERED"|"ORDERED"){
    const active=modelRef.current.blocks.find(block=>block.block_id===activeBlockId);
    if(active?.type==="LIST"){replaceBlock(active.block_id,{...active,style});return}
    if(active&&(active.type==="PARAGRAPH"||active.type==="HEADING")){
      const replacement={...newBlock("LIST"),block_id:active.block_id,style,items:[active.content]} as Block;
      replaceBlock(active.block_id,replacement);setActiveBlockId(active.block_id);
      requestAnimationFrame(()=>document.getElementById(`bp-list-${active.block_id}-0`)?.focus());
      return;
    }
    insertBlock("LIST",{style,items:[rich("")]});
  }
  function convertActiveToQuote(){
    const active=modelRef.current.blocks.find(block=>block.block_id===activeBlockId);
    if(active?.type==="QUOTE")return;
    if(active&&(active.type==="PARAGRAPH"||active.type==="HEADING")){
      const replacement={...newBlock("QUOTE"),block_id:active.block_id,quote:active.content} as Block;
      replaceBlock(active.block_id,replacement);setActiveBlockId(active.block_id);return;
    }
    insertBlock("QUOTE");
  }
  function sendRichTextShortcut(key:"b"|"i"|"k"){
    const editor=activeEditorId?document.getElementById(activeEditorId):null;
    if(!(editor instanceof HTMLElement))return;
    if(document.activeElement!==editor)editor.focus();
    editor.dispatchEvent(new KeyboardEvent("keydown",{key,ctrlKey:true,bubbles:true,cancelable:true}));
  }
  function exitList(blockId:string,itemIndex:number){
    const paragraph=newBlock("PARAGRAPH");
    commitModel(current=>{
      const index=current.blocks.findIndex(block=>block.block_id===blockId);if(index<0)return current;
      const block=current.blocks[index];if(!block||block.type!=="LIST")return current;
      const liveItems=listRichItems(block);if(itemIndex!==liveItems.length-1||richText(liveItems[itemIndex]).trim())return current;
      const kept=liveItems.filter((_,i)=>i!==itemIndex);const next=[...current.blocks];
      if(kept.length)next.splice(index,1,{...block,items:kept},paragraph);else next.splice(index,1,paragraph);
      return {...current,blocks:next};
    });
    setActiveBlockId(paragraph.block_id);focusWriter(paragraph.block_id);
  }
  function slashCommand(blockId:string,command:string):boolean{
    const normalized=command.trim().toLowerCase();
    const spec:Record<string,{type:BlockType;overrides?:UnknownRecord}>={
      "/paragraph":{type:"PARAGRAPH"},"/p":{type:"PARAGRAPH"},"/h2":{type:"HEADING",overrides:{level:2}},"/h3":{type:"HEADING",overrides:{level:3}},
      "/list":{type:"LIST",overrides:{style:"UNORDERED",items:[rich("")]}},"/bullet":{type:"LIST",overrides:{style:"UNORDERED",items:[rich("")]}},
      "/number":{type:"LIST",overrides:{style:"ORDERED",items:[rich("")]}},"/quote":{type:"QUOTE"},"/image":{type:"MEDIA"},
      "/table":{type:"TABLE",overrides:{rows:[[rich(""),rich("")],[rich(""),rich("")]]}},"/divider":{type:"SEPARATOR"},"/separator":{type:"SEPARATOR"},
    };
    const target=spec[normalized];if(!target)return false;
    const replacement={...newBlock(target.type),...(target.overrides??{}),block_id:blockId} as Block;
    replaceBlock(blockId,replacement);setActiveBlockId(blockId);
    if(target.type==="HEADING")focusWriter(blockId);return true;
  }

  async function createInitialDraft(announce=true){
    if(mode!=="create"||createMutation.isPending)return;
    const includeTags=permissions.includes("tags.view");const creationRevision=editRevisionRef.current;const creationSnapshot=modelRef.current;
    const result=await createMutation.mutateAsync({path:{site_key:site.site_key},body:createBody(creationSnapshot,includeTags)});
    const created=asRecord(asRecord(result).post);const createdId=stringValue(created,"post_id","");
    if(!createdId||createdId==="—")throw new Error("Created draft did not return a post id");
    let version=Number(created.version??1);serverVersionRef.current=version;setServerVersion(version);let persistedRevision=creationRevision;
    while(editRevisionRef.current>persistedRevision){
      const revision=editRevisionRef.current;const snapshot=modelRef.current;
      const savedResult=await saveMutation.mutateAsync({path:{site_key:site.site_key,post_id:createdId},body:{...createBody(snapshot,includeTags),expected_version:version}});
      const saved=asRecord(asRecord(savedResult).post);version=Number(saved.version??version);serverVersionRef.current=version;setServerVersion(version);persistedRevision=revision;
    }
    dirtyState.setDirty(false);setAutosaveState("clean");if(announce)setSuccess("Draft created");
    navigate(`/site/${site.site_key}/posts/${createdId}`,{replace:true});
  }
  async function saveExisting(announce=true):Promise<UnknownRecord>{
    const includeTags=permissions.includes("tags.view");const snapshotRevision=editRevisionRef.current;const snapshot=modelRef.current;const expectedVersion=serverVersionRef.current;
    const result=await saveMutation.mutateAsync({path:{site_key:site.site_key,post_id:postId},body:{...createBody(snapshot,includeTags),expected_version:expectedVersion}});
    const saved=asRecord(asRecord(result).post);const nextVersion=Number(saved.version??expectedVersion);const nextStatus=stringValue(saved,"status",status);const nextSlug=postSlug(saved,snapshot.slug);
    serverVersionRef.current=nextVersion;setServerVersion(nextVersion);setStatus(nextStatus);
    if(nextSlug!==modelRef.current.slug)setModel(current=>{const next={...current,slug:nextSlug};modelRef.current=next;return next});
    if(editRevisionRef.current===snapshotRevision){dirtyState.setDirty(false);setAutosaveState("clean");if(announce)setSuccess(nextStatus==="PUBLISHED"?"Published article updated":"Draft changes saved")}
    else{dirtyState.setDirty(true);setAutosaveState("unsaved")}
    return saved;
  }
  async function saveDurable(){setSuccess(undefined);if(mode==="create"){await createInitialDraft(true);return}await saveExisting(true)}
  async function saveBeforeLifecycle():Promise<number>{
    if(mode!=="edit")return serverVersionRef.current;
    let persistedRevision=-1;
    while(dirtyState.dirty&&editRevisionRef.current!==persistedRevision){
      persistedRevision=editRevisionRef.current;await saveExisting(false);if(editRevisionRef.current===persistedRevision)break;
    }
    return serverVersionRef.current;
  }
  async function autosaveNow(){
    if(mode!=="edit"||!dirtyState.dirty||editRevisionRef.current<=lastAutosavedRevisionRef.current)return;
    const requestRevision=editRevisionRef.current;const workingCopy=createBody(modelRef.current,permissions.includes("tags.view"));const baseVersion=serverVersionRef.current;
    setAutosaveState("saving");
    try{
      const data=await autosaveMutation.mutateAsync({path:{site_key:site.site_key,post_id:postId},body:{editor_instance_id:editorInstanceId,base_version:baseVersion,working_copy:workingCopy}});
      lastAutosavedRevisionRef.current=Math.max(lastAutosavedRevisionRef.current,requestRevision);
      if(editRevisionRef.current===requestRevision){setAutosaveState("saved");setAutosaveTime(formatDate(asRecord(data).saved_at))}else setAutosaveState("unsaved");
    }catch{if(editRevisionRef.current===requestRevision)setAutosaveState("error");else setAutosaveState("unsaved")}
  }
  async function resolvedPublicOrigin():Promise<string>{
    const response=await transport.request<UnknownRecord>("API15-S-001",{path:{site_key:site.site_key}});
    const value=response.headers.get("X-BP-Public-Url");if(!value)throw new Error("Public website URL is unavailable");
    return value.replace(/\/$/,"");
  }
  async function preview(){
    if(mode!=="edit")return;
    const useWorkingCopy=dirtyState.dirty||status==="PUBLISHED";
    const body=useWorkingCopy?{source_kind:"WORKING_COPY",base_version:serverVersion,working_copy:createBody(model,permissions.includes("tags.view"))}:{source_kind:"COMMITTED"};
    const result=await previewMutation.mutateAsync({path:{site_key:site.site_key,post_id:postId},body});
    const raw=stringValue(asRecord(result),"preview_url","");
    if(!raw||raw==="—")return;
    const origin=await resolvedPublicOrigin();
    let pathAndQuery=raw;
    try{const parsed=new URL(raw);pathAndQuery=`${parsed.pathname}${parsed.search}${parsed.hash}`}catch{/* keep server-relative value */}
    window.open(`${origin}${pathAndQuery.startsWith("/")?"":"/"}${pathAndQuery}`,"_blank","noopener,noreferrer");
  }
  async function openLivePost(){
    if(!model.slug)return;
    setOpeningPublic(true);
    try{const origin=await resolvedPublicOrigin();window.open(`${origin}/article/${encodeURIComponent(model.slug)}`,"_blank","noopener,noreferrer")}finally{setOpeningPublic(false)}
  }
  async function versionCommand(mutation:typeof archiveMutation,label:string,expectedVersion=serverVersionRef.current){
    const actionRevision=editRevisionRef.current;
    const result=await mutation.mutateAsync({path:{site_key:site.site_key,post_id:postId},body:{expected_version:expectedVersion}});
    const p=asRecord(asRecord(result).post);const nextVersion=Number(p.version??expectedVersion);serverVersionRef.current=nextVersion;setServerVersion(nextVersion);setStatus(stringValue(p,"status",status));const slug=postSlug(p,modelRef.current.slug);if(slug!==modelRef.current.slug)setModel(current=>{const next={...current,slug};modelRef.current=next;return next});
    if(editRevisionRef.current===actionRevision){dirtyState.setDirty(false);setAutosaveState("clean")}else{dirtyState.setDirty(true);setAutosaveState("unsaved")}setSuccess(label);
  }
  async function publishCurrent(){
    setPublishReviewOpen(false);
    const version=await saveBeforeLifecycle();const lifecycleRevision=editRevisionRef.current;
    const result=await publishMutation.mutateAsync({path:{site_key:site.site_key,post_id:postId},body:{expected_version:version}});
    const p=asRecord(asRecord(result).post);const slug=postSlug(p,modelRef.current.slug);const nextVersion=Number(p.version??version);serverVersionRef.current=nextVersion;setServerVersion(nextVersion);setStatus(stringValue(p,"status","PUBLISHED"));if(slug!==modelRef.current.slug)setModel(current=>{const next={...current,slug};modelRef.current=next;return next});
    if(editRevisionRef.current===lifecycleRevision){dirtyState.setDirty(false);setAutosaveState("clean")}else{dirtyState.setDirty(true);setAutosaveState("unsaved")}setSuccess("Post published");
  }
  async function schedule(){
    const version=await saveBeforeLifecycle();const lifecycleRevision=editRevisionRef.current;
    const result=await scheduleMutation.mutateAsync({path:{site_key:site.site_key,post_id:postId},body:{expected_version:version,schedule_local_input:scheduleLocal,schedule_timezone_id:scheduleTz}});
    const p=asRecord(asRecord(result).post);const slug=postSlug(p,modelRef.current.slug);const nextVersion=Number(p.version??version);serverVersionRef.current=nextVersion;setServerVersion(nextVersion);setStatus(stringValue(p,"status","SCHEDULED"));if(slug!==modelRef.current.slug)setModel(current=>{const next={...current,slug};modelRef.current=next;return next});
    if(editRevisionRef.current===lifecycleRevision){dirtyState.setDirty(false);setAutosaveState("clean")}else{dirtyState.setDirty(true);setAutosaveState("unsaved")}setScheduleOpen(false);setSuccess("Post scheduled");
  }
  async function unschedule(){
    const version=await saveBeforeLifecycle();const lifecycleRevision=editRevisionRef.current;
    const result=await unscheduleMutation.mutateAsync({path:{site_key:site.site_key,post_id:postId},body:{expected_version:version}});
    const p=asRecord(asRecord(result).post);const nextVersion=Number(p.version??version);serverVersionRef.current=nextVersion;setServerVersion(nextVersion);setStatus(stringValue(p,"status","DRAFT"));if(editRevisionRef.current===lifecycleRevision){dirtyState.setDirty(false);setAutosaveState("clean")}else{dirtyState.setDirty(true);setAutosaveState("unsaved")}setSuccess("Schedule removed");
  }
  async function confirmLifecycle(){
    const action=confirmAction;setConfirmAction(undefined);
    if(action==="archive"){const version=await saveBeforeLifecycle();await versionCommand(archiveMutation,"Post archived",version)}
    if(action==="trash"){const version=await saveBeforeLifecycle();await versionCommand(trashMutation,"Post moved to Trash",version)}
    if(action==="restore")await versionCommand(restoreMutation,"Post restored to non-public working state");
    if(action==="delete"){await deleteMutation.mutateAsync({path:{site_key:site.site_key,post_id:postId},body:{expected_version:serverVersion}});dirtyState.setDirty(false);navigate(`/site/${site.site_key}/posts`)}
  }
  function recover(){
    const auto=asRecord(autosaveQuery.data);const copy=asRecord(auto.working_copy);const body=asRecord(copy.body);const recoveredBlocks=safeBlocks(body.blocks);const current=modelRef.current;
    const recovered={...current,title:stringValue(copy,"title",current.title),excerpt:stringValue(copy,"excerpt",current.excerpt),blocks:recoveredBlocks.length?recoveredBlocks:[newBlock("PARAGRAPH")],slug:stringValue(copy,"slug",current.slug),author:stringValue(copy,"author_site_profile_id",current.author),categories:arrayValue(copy,"category_ids").join(", "),tags:arrayValue(copy,"tag_ids").join(", "),featuredMedia:stringValue(copy,"featured_media_id",current.featuredMedia),related:arrayValue(copy,"manual_related_post_ids").join(", "),seoTitle:stringValue(copy,"seo_title",current.seoTitle),metaDescription:stringValue(copy,"meta_description",current.metaDescription),canonical:stringValue(copy,"canonical_override",current.canonical),indexPolicy:stringValue(copy,"index_policy",current.indexPolicy),robots:stringValue(copy,"link_robots_policy",current.robots),ogTitle:stringValue(copy,"og_title",current.ogTitle),ogDescription:stringValue(copy,"og_description",current.ogDescription),ogImage:stringValue(copy,"og_image_media_id",current.ogImage),breadcrumbLabel:stringValue(copy,"breadcrumb_label",current.breadcrumbLabel)};
    editRevisionRef.current+=1;setModel(recovered);modelRef.current=recovered;dirtyState.setDirty(true);dirtyState.setDirtyLabel("recovered autosave changes");setAutosaveState("unsaved");setRecoverOpen(false);
  }
  function toggleCategory(categoryId:string,checked:boolean){
    const selected=new Set(ids(model.categories));if(checked)selected.add(categoryId);else selected.delete(categoryId);update("categories",[...selected].join(", "));
  }

  const required=mode==="create"?["posts.view","posts.create"]:["posts.view","posts.edit"];
  const canPreview=mode==="edit"&&permissions.includes("posts.preview");
  const context=mode==="create"?`${site.display_name} · new draft`:`${site.display_name} · ${status} · version ${serverVersion}`;
  const publishProblems=[
    !model.title.trim()?"Add a title.":"",
    !hasMeaningfulBody(model.blocks)?"Add article content.":"",
    !model.author?"Choose an author.":"",
  ].filter(Boolean);
  const publishWarnings=[
    !ids(model.categories).length?"No category selected.":"",
    !model.featuredMedia?"No featured image selected.":"",
    !model.seoTitle.trim()?"SEO title is using the article title.":"",
    !model.metaDescription.trim()?"Meta description is empty.":"",
  ].filter(Boolean);
  const authors=asRecords(asRecord(authorsQuery.data).items);
  const categories=asRecords(asRecord(categoriesQuery.data).items);

  if(mode==="edit"&&!hydrated.current)return <PageFrame pageId="ADM-S-POST-03"><QueryState isLoading={postQuery.isLoading} error={postQuery.error} hasData={Boolean(postQuery.data)} retry={()=>void postQuery.refetch()}><span/></QueryState></PageFrame>;

  return <PageFrame pageId={mode==="create"?"ADM-S-POST-02":"ADM-S-POST-03"} required={required} context={context} back={<Link to={`/site/${site.site_key}/posts`}>← Back to Posts</Link>} actions={<>
    <AutosaveIndicator state={autosaveState} {...(autosaveTime!==undefined?{time:autosaveTime}:{})} onRetry={()=>void autosaveNow()}/>
    {canPreview?<Button onClick={()=>void preview()} loading={previewMutation.isPending}>Preview</Button>:null}
    {mode==="edit"&&status==="PUBLISHED"&&model.slug?<Button onClick={()=>void openLivePost()} loading={openingPublic}>View Live Post</Button>:null}
    <Button onClick={()=>void saveDurable()} loading={createMutation.isPending||saveMutation.isPending}>{mode==="create"?"Save draft":status==="PUBLISHED"?"Update":"Save draft"}</Button>
    {mode==="edit"&&permissions.includes("posts.schedule")&&status!=="PUBLISHED"&&status!=="TRASH"&&status!=="ARCHIVED"?<Button onClick={()=>setScheduleOpen(true)}>{status==="SCHEDULED"?"Reschedule":"Schedule"}</Button>:null}
    {mode==="edit"&&permissions.includes("posts.schedule")&&status==="SCHEDULED"?<Button onClick={()=>void unschedule()} loading={unscheduleMutation.isPending}>Unschedule</Button>:null}
    {mode==="edit"&&permissions.includes("posts.publish")&&status!=="PUBLISHED"&&status!=="TRASH"&&status!=="ARCHIVED"?<Button variant="primary" onClick={()=>setPublishReviewOpen(true)}>Publish…</Button>:null}
  </>}>
    {conflict?<div className="bp-conflict-sticky"><ConflictPanel onReload={()=>window.location.reload()}>The server rejected a stale write. Your local editor values remain visible. Reload the authoritative version before deciding how to continue; automatic overwrite is prohibited.</ConflictPanel></div>:null}
    {success?<SuccessState>{success}. The visible status/version is refreshed from the server response.</SuccessState>:null}
    {anyError&&!conflict?<Alert tone="danger">{anyError instanceof AdminRequestError&&anyError.failure.uiState==="VALIDATION"?"Server validation rejected the current working copy. Review the highlighted publishing requirements.":"The requested editor action was not accepted."}</Alert>:null}

    <div className={`bp-editor-layout${settingsOpen?"":" bp-editor-layout--wide"}`}>
      <section className="bp-editor-canvas" aria-label="Article editor canvas" onFocusCapture={event=>{const target=event.target as HTMLElement;if(target.classList.contains("bp-rich-text-surface")&&target.id)setActiveEditorId(target.id)}}>
        <TextField className="bp-editor-title" label="Article title" placeholder="Add title" value={model.title} onChange={e=>update("title",e.target.value)}/>
        <div className="bp-editor-commandbar" role="toolbar" aria-label="Editor toolbar">
          <BlockInsertMenu label="+ Add block" onInsert={(type,overrides)=>insertBlock(type,overrides)}/>
          <Button type="button" variant="tertiary" onClick={()=>insertBlock("MEDIA")}>Add Media</Button>
          <select className="bp-select bp-toolbar-block-type" aria-label="Block type" value={model.blocks.find(block=>block.block_id===activeBlockId)?.type==="HEADING"?`H${Number(model.blocks.find(block=>block.block_id===activeBlockId)?.level??2)}`:"PARAGRAPH"} onChange={event=>applyToolbarTextType(event.target.value as "PARAGRAPH"|"H2"|"H3"|"H4")}><option value="PARAGRAPH">Paragraph</option><option value="H2">Heading 2</option><option value="H3">Heading 3</option><option value="H4">Heading 4</option></select>
          <span className="bp-toolbar-divider" aria-hidden="true"/>
          <Button type="button" variant="tertiary" onMouseDown={event=>event.preventDefault()} onClick={()=>sendRichTextShortcut("b")} title="Bold (⌘/Ctrl+B)"><strong>Bold</strong></Button>
          <Button type="button" variant="tertiary" onMouseDown={event=>event.preventDefault()} onClick={()=>sendRichTextShortcut("i")} title="Italic (⌘/Ctrl+I)"><em>Italic</em></Button>
          <Button type="button" variant="tertiary" onMouseDown={event=>event.preventDefault()} onClick={()=>sendRichTextShortcut("k")} title="Link (⌘/Ctrl+K)">Link</Button>
          <span className="bp-toolbar-divider" aria-hidden="true"/>
          <Button type="button" variant="tertiary" onClick={()=>convertActiveToList("UNORDERED")}>Bullets</Button>
          <Button type="button" variant="tertiary" onClick={()=>convertActiveToList("ORDERED")}>Numbers</Button>
          <Button type="button" variant="tertiary" onClick={convertActiveToQuote}>Quote</Button>
          <Button type="button" variant="tertiary" onClick={()=>insertBlock("TABLE",blockDefaults("TABLE"))}>Table</Button>
          <Button type="button" variant="tertiary" onClick={()=>insertBlock("SEPARATOR")}>Divider</Button>
          <span className="bp-toolbar-divider" aria-hidden="true"/>
          <Button type="button" variant="tertiary" onClick={undoEditor} disabled={!historyState.canUndo} title="Undo (⌘/Ctrl+Z)">Undo</Button>
          <Button type="button" variant="tertiary" onClick={redoEditor} disabled={!historyState.canRedo} title="Redo (⌘/Ctrl+Shift+Z)">Redo</Button>
          <span className="bp-editor-toolbar-spacer"/>
          <Button type="button" variant="tertiary" onClick={()=>setSettingsOpen(value=>!value)}>{settingsOpen?"Hide settings":"Settings"}</Button>
        </div>
        <p className="bp-writer-hint">Start writing below. Press Enter for a new paragraph. Type <strong>/</strong> to choose a block.</p>
        <div className="bp-block-list">
          {model.blocks.map((block,index)=><div className="bp-block-stack" key={block.block_id}>
            <BlockEditor siteKey={site.site_key} block={block} index={index} count={model.blocks.length} active={activeBlockId===block.block_id} onChange={next=>replaceBlock(block.block_id,next)} onMove={delta=>moveBlock(block.block_id,delta)} onRemove={()=>removeBlock(block.block_id)} onDuplicate={()=>duplicateBlock(block.block_id)} onSplit={offset=>splitBlock(block.block_id,offset)} onMergePrevious={()=>mergePrevious(block.block_id)} onExitList={itemIndex=>exitList(block.block_id,itemIndex)} onFocus={()=>setActiveBlockId(block.block_id)} onUndo={undoEditor} onRedo={redoEditor} onSlashCommand={command=>slashCommand(block.block_id,command)} onDragStart={()=>setDraggedBlockId(block.block_id)} onDrop={()=>{if(draggedBlockId)reorderBlock(draggedBlockId,block.block_id);setDraggedBlockId(undefined)}}/>
            <div className="bp-inline-inserter"><BlockInsertMenu onInsert={(type,overrides)=>insertBlockAt(index+1,type,overrides)}/></div>
          </div>)}
        </div>
      </section>

      {settingsOpen?<aside className="bp-editor-rail" aria-label="Post settings">
        <div className="bp-editor-settings-tabs" role="tablist" aria-label="Editor settings">
          <button type="button" role="tab" aria-selected={settingsTab==="post"} className={settingsTab==="post"?"is-active":""} onClick={()=>setSettingsTab("post")}>Post</button>
          <button type="button" role="tab" aria-selected={settingsTab==="block"} className={settingsTab==="block"?"is-active":""} onClick={()=>setSettingsTab("block")} disabled={!activeBlockId}>Block</button>
        </div>
        {settingsTab==="post"?<>
          <FormSection title="Post settings">
            <div className="bp-editor-status-row"><span>Status</span><StatusBadge value={status}/></div>
            <TextArea label="Short summary" value={model.excerpt} onChange={e=>update("excerpt",e.target.value)} placeholder="A short description of this article."/>
            <SelectField label="Author" value={model.author} onChange={e=>update("author",e.target.value)} disabled={!permissions.includes("authors.view")}><option value="">Choose author</option>{authors.map(author=><option key={stringValue(author,"author_id")} value={stringValue(author,"author_id")}>{stringValue(author,"display_name")}</option>)}</SelectField>
            <div className="bp-field"><span className="bp-label">Categories</span><div className="bp-category-checklist">{categories.length?categories.map(category=>{const id=stringValue(category,"category_id");return <Checkbox key={id} label={stringValue(category,"name","Unnamed category")} checked={ids(model.categories).includes(id)} onChange={e=>toggleCategory(id,e.target.checked)} disabled={!permissions.includes("categories.view")}/>}):<span className="bp-field-hint">No categories are available for this website.</span>}</div></div>
          </FormSection>
          {permissions.includes("media.view")?<FormSection title="Featured image"><MediaPicker siteKey={site.site_key} value={model.featuredMedia} onSelect={mediaId=>update("featuredMedia",mediaId)} label="Choose featured image"/></FormSection>:null}
          {permissions.includes("search.view")&&(permissions.includes("posts.edit")||permissions.includes("posts.create"))?<RelatedCandidatePanel siteKey={site.site_key} {...(mode==="edit"&&postId?{postId}:{})} relatedIds={ids(model.related)} onChange={values=>update("related",values.join(", "))}/>:null}
          <FormSection title="Search appearance">
            <TextField label="SEO title" value={model.seoTitle} onChange={e=>update("seoTitle",e.target.value)} disabled={!permissions.includes("seo.edit")} placeholder={model.title||"Article title"}/>
            <TextArea label="Meta description" value={model.metaDescription} onChange={e=>update("metaDescription",e.target.value)} disabled={!permissions.includes("seo.edit")} placeholder={model.excerpt||"Short search description"}/>
            <TextField label="URL slug" value={model.slug} onChange={e=>update("slug",e.target.value)} placeholder="Generated from title when published"/>
            <div className="bp-search-preview"><span>Search preview</span><strong>{model.seoTitle||model.title||"Your article title"}</strong><p>{model.metaDescription||model.excerpt||"Add a short description for search results."}</p></div>
            {permissions.includes("media.view")?<MediaPicker siteKey={site.site_key} value={model.ogImage} fallbackValue={model.featuredMedia} fallbackLabel="Using Featured Image" onSelect={mediaId=>update("ogImage",mediaId)} label="Choose social image"/>:null}
          </FormSection>
          {mode==="edit"&&postId?<details className="bp-advanced-settings"><summary>Advanced URL history</summary><UrlHistoryPanel siteKey={site.site_key} postId={postId}/></details>:null}
          {mode==="edit"?<section className="bp-editor-lifecycle"><h3>Post actions</h3><div className="bp-editor-lifecycle-actions">
            {permissions.includes("posts.archive")&&status!=="ARCHIVED"&&status!=="TRASH"?<Button onClick={()=>setConfirmAction("archive")}>Archive</Button>:null}
            {permissions.includes("posts.trash")&&status!=="TRASH"?<Button variant="destructive" onClick={()=>setConfirmAction("trash")}>Move to Trash</Button>:null}
            {permissions.includes("posts.restore")&&status==="TRASH"?<Button onClick={()=>setConfirmAction("restore")}>Restore</Button>:null}
            {permissions.includes("posts.duplicate")?<Button onClick={()=>void duplicateMutation.mutateAsync({path:{site_key:site.site_key,post_id:postId},body:{}}).then(result=>{const p=asRecord(asRecord(result).post);navigate(`/site/${site.site_key}/posts/${stringValue(p,"post_id")}`)})}>Duplicate</Button>:null}
            {permissions.includes("posts.delete")&&status==="TRASH"?<Button variant="destructive" onClick={()=>setConfirmAction("delete")}>Permanent delete</Button>:null}
          </div>{permissions.includes("posts.revisions.view")?<p><Link to={`/site/${site.site_key}/posts/${postId}/revisions`}>Revision history</Link></p>:null}</section>:null}
        </>:activeBlockId?(()=>{const selected=model.blocks.find(block=>block.block_id===activeBlockId);if(!selected)return <p className="bp-field-hint">Select a block to edit its settings.</p>;return <section className="bp-selected-block-settings"><h3>{BLOCK_LABELS[selected.type]}</h3><p className="bp-field-hint">Block controls stay contextual so the writing canvas remains clean.</p>{selected.type==="PARAGRAPH"||selected.type==="HEADING"?<SelectField label="Block type" value={selected.type==="PARAGRAPH"?"PARAGRAPH":`H${Number(selected.level??2)}`} onChange={event=>transformTextBlock(selected.block_id,event.target.value as "PARAGRAPH"|"H2"|"H3"|"H4")}><option value="PARAGRAPH">Paragraph</option><option value="H2">Heading 2</option><option value="H3">Heading 3</option><option value="H4">Heading 4</option></SelectField>:null}{selected.type==="LIST"?<SelectField label="List style" value={String(selected.style??"UNORDERED")} onChange={event=>replaceBlock(selected.block_id,{...selected,style:event.target.value})}><option value="UNORDERED">Bulleted list</option><option value="ORDERED">Numbered list</option></SelectField>:null}<div className="bp-inline-actions"><Button type="button" onClick={()=>moveBlock(selected.block_id,-1)}>Move up</Button><Button type="button" onClick={()=>moveBlock(selected.block_id,1)}>Move down</Button><Button type="button" onClick={()=>duplicateBlock(selected.block_id)}>Duplicate</Button><Button type="button" variant="destructive" onClick={()=>removeBlock(selected.block_id)}>Remove</Button></div></section>})():<p className="bp-field-hint">Select a block to edit its settings.</p>}
      </aside>:null}
    </div>

    <Modal open={publishReviewOpen} title="Ready to publish?" description="Review the essentials. Publishing will save the current editor content first, then publish that exact server version." onClose={()=>setPublishReviewOpen(false)} footer={<><Button onClick={()=>setPublishReviewOpen(false)}>Cancel</Button><Button variant="primary" onClick={()=>void publishCurrent()} loading={publishMutation.isPending||saveMutation.isPending} disabled={publishProblems.length>0}>Publish now</Button></>}>
      <div className="bp-publish-review">
        <div><strong>Title</strong><span>{model.title||"Missing"}</span></div>
        <div><strong>Author</strong><span>{authors.find(author=>stringValue(author,"author_id")===model.author)?stringValue(authors.find(author=>stringValue(author,"author_id")===model.author)!,"display_name"):"Missing"}</span></div>
        <div><strong>Categories</strong><span>{ids(model.categories).length||"None"}</span></div>
        <div><strong>Featured image</strong><span>{model.featuredMedia?"Selected":"Not selected"}</span></div>
        <div><strong>URL</strong><span>{model.slug||"Will be generated from the title"}</span></div>
      </div>
      {publishProblems.length?<Alert tone="danger"><strong>Required before publishing:</strong><ul>{publishProblems.map(problem=><li key={problem}>{problem}</li>)}</ul></Alert>:null}
      {publishWarnings.length?<Alert tone="warning"><strong>Optional improvements:</strong><ul>{publishWarnings.map(warning=><li key={warning}>{warning}</li>)}</ul></Alert>:null}
    </Modal>

    <Modal open={scheduleOpen} title={status==="SCHEDULED"?"Reschedule publication":"Schedule publication"} description={`Choose the publication time in ${scheduleTz}. Current editor changes will be saved before scheduling.`} onClose={()=>setScheduleOpen(false)} footer={<><Button onClick={()=>setScheduleOpen(false)}>Cancel</Button><Button variant="primary" onClick={()=>void schedule()} loading={scheduleMutation.isPending||saveMutation.isPending} disabled={!scheduleLocal||publishProblems.length>0}>{status==="SCHEDULED"?"Reschedule":"Schedule"}</Button></>}>
      <div className="bp-form-stack"><TextField label={`Date and time (${scheduleTz})`} type="datetime-local" value={scheduleLocal} onChange={e=>setScheduleLocal(e.target.value)} required/>{publishProblems.length?<Alert tone="danger">Add a title, article content and author before scheduling.</Alert>:null}</div>
    </Modal>

    <Modal open={recoverOpen} title="Newer autosave available" description="Autosave is private recovery state, not a formal revision or publication." onClose={()=>setRecoverOpen(false)} footer={<><Button onClick={()=>setRecoverOpen(false)}>Keep server version</Button><Button variant="primary" onClick={recover}>Load autosave into editor</Button></>}><Alert tone="warning">Loading this autosave changes only the browser working copy. An explicit durable save is still required.</Alert></Modal>

    <Modal open={Boolean(confirmAction)} title={confirmAction==="delete"?"Permanently delete post?":`${confirmAction??"Change"} post?`} description={confirmAction==="restore"?"Restore returns a trashed Post to a non-public working state; it never silently republishes.":"This lifecycle action is server-authorized and version-checked. A stale write will be rejected."} onClose={()=>setConfirmAction(undefined)} footer={<><Button onClick={()=>setConfirmAction(undefined)}>Cancel</Button>{confirmAction==="delete"?<Link className="bp-button bp-button--secondary" to="/step-up">Reauthenticate first</Link>:null}<Button variant="destructive" onClick={()=>void confirmLifecycle()}>{confirmAction==="delete"?"Permanent delete":"Confirm"}</Button></>}><Alert tone={confirmAction==="delete"?"danger":"warning"}>The browser cannot bypass permission, lifecycle, target ownership, version, or required step-up checks.</Alert></Modal>
  </PageFrame>;
}

