import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

export default function ({
  contents,
  uploadDir,
}: {
  contents: Record<any, any> | string;
  uploadDir?: string;
}) {
  return <SimpleEditor contents={contents} uploadDir={uploadDir} />;
}
