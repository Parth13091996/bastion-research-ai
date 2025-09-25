import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

export default function ({
  contents,
}: {
  contents: Record<any, any> | string;
}) {
  return <SimpleEditor contents={contents} />;
}
