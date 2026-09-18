import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "../ui/components";
import { expect, test } from "vitest";

test("modal exposes dialog semantics, Escape close, and focusable control",async()=>{
  const user=userEvent.setup(); let closed=false;
  render(<Modal open title="Confirm action" description="Example" onClose={()=>{closed=true}}><button>Inside</button></Modal>);
  expect(screen.getByRole("dialog",{name:"Confirm action"})).toHaveAttribute("aria-modal","true");
  await user.keyboard("{Escape}");
  expect(closed).toBe(true);
});
