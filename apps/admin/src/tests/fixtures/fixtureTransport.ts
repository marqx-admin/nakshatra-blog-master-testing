import type { AdminOperationId } from "@bp/api-client-admin";
import type { AdminRequestInput, AdminResponse, AdminTransport } from "../../app/query-client/adminTransport";

const uuid="00000000-0000-4000-8000-000000000001";
const sitePermissions=["dashboard.view","posts.view","posts.create","posts.edit","posts.preview","posts.duplicate","posts.revisions.view","posts.revisions.restore","posts.publish","posts.schedule","posts.archive","posts.trash","posts.restore","posts.delete","categories.view","categories.create","categories.edit","categories.delete","tags.view","tags.create","tags.edit","tags.delete","authors.view","authors.create","authors.edit","authors.retire","media.view","media.upload","media.edit","media.replace","media.delete","navigation.view","navigation.manage","seo.view","seo.edit","redirects.view","redirects.create","redirects.edit","redirects.delete","search.view","search.reindex","calendar.view","site_settings.view","site_settings.edit"];
const globalPermissions=["network_dashboard.view","sites.view","sites.create","sites.edit","sites.enable","sites.disable","sites.archive","sites.deletion_request","sites.manage_domains","admin_users.view","admin_users.invite","admin_users.edit","admin_users.enable","admin_users.disable","admin_users.manage_site_assignments","roles.view","roles.create","roles.edit","roles.retire","roles.assign","audit.view","audit.export","platform_settings.view","platform_settings.edit","permissions.view"];
const post={post_id:uuid,status:"DRAFT",version:1,title:"Fixture Post",excerpt:"",body:{content_schema_version:"1.0",blocks:[]},category_ids:[],tag_ids:[],manual_related_post_ids:[],updated_at:new Date().toISOString(),created_at:new Date().toISOString()};
function dataFor(id:AdminOperationId,input?:AdminRequestInput):unknown{
  if(id==="API15-S-001")return {site_key:String(input?.path?.site_key??"SITE-01"),display_name:"Fixture Site",lifecycle_state:"ACTIVE",effective_permissions:sitePermissions};
  if(id==="API15-G-001")return {effective_permissions:globalPermissions};
  if(id==="API15-S-002")return {metrics:[{key:"drafts",label:"Drafts",value:1}],attention_items:[]};
  if(id==="API15-S-010")return {items:[post],page:{page:1,page_size:20,has_more:false}};
  if(id==="API15-S-012")return {post};
  if(id==="API15-S-015")return {autosave_id:uuid,post_id:uuid,base_version:1,saved_at:"2000-01-01T00:00:00Z",working_copy:{body:post.body}};
  if(id==="API15-S-026")return {items:[],page:{page:1,page_size:50,has_more:false}};
  if(id==="API15-S-028")return {items:[]};
  if(id==="API15-S-091"||id==="API15-S-092")return {items:[],page:{page:1,page_size:20,has_more:false}};
  if(id==="API15-S-030"||id==="API15-S-040"||id==="API15-S-050"||id==="API15-S-060"||id==="API15-S-082")return {items:[]};
  if(id==="API15-S-070")return {header:{items:[]},footer:{items:[]}};
  if(id==="API15-S-072")return {homepage:{sections:[]}};
  if(id==="API15-S-080")return {seo:{index_policy:"INHERIT",link_robots_policy:"INHERIT"}};
  if(id==="API15-S-093")return {state:"READY"};
  if(id==="API15-S-095")return {items:[],from:"2026-09-01",to:"2026-10-01"};
  if(id==="API15-S-096")return {settings:[]};
  if(id==="API15-G-002")return {site_count:14,aggregates:[],site_summaries:[]};
  if(id==="API15-G-003"||id==="API15-G-010"||id==="API15-G-030"||id==="API15-G-040"||id==="API15-G-050")return {items:[],page:{page:1,page_size:20,has_more:false}};
  if(id==="API15-G-046")return {items:[],count:69};
  if(id==="API15-G-060")return {settings:[]};
  return {};
}
export function fixtureTransport():AdminTransport{return {async request<T = unknown>(id:AdminOperationId,input?:AdminRequestInput,_signal?:AbortSignal):Promise<AdminResponse<T>>{return {status:200,data:dataFor(id,input) as T,headers:new Headers({"X-Request-ID":"fixture"})}}}}
