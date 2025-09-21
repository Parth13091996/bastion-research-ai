import { Node } from "slate";

const transform = ({ id, type, blocks = [], ...rest }: any) => {
  if (id) {
    return {
      type,
      id: id,
      documentId: "270804c8-eaeb-3b9a-3240-c71a09e53716",
      pageStyleData: {},
      rawProperties: {},
      ...rest,
      ...(blocks.length ? { blocks: blocks.map(transform) } : {})
    };
  } else {
    return {
      ...rest,
      ...(blocks.length ? { blocks: blocks.map(transform) } : {})
    };
  }
};

const transformEditorPayload = (payload: any) => {
  const newPayloadString = JSON.stringify(payload).replace(
    /children/g,
    "blocks"
  );

  var newPayload = JSON.parse(newPayloadString);

  newPayload = transform({ blocks: newPayload }).blocks;

  const final = {
    schemaVersion: "1",
    spaceId: "70670d79-f1f7-bb7d-f8ee-997e14322d29",
    documentId: "270804c8-eaeb-3b9a-3240-c71a09e53716",
    blocks: newPayload
  };

  return final;
};

export default transformEditorPayload;
