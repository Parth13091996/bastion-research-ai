import { supabase } from "./client";
import { TablesInsert } from "./types";

export const addUser = async (user: TablesInsert<"users">) => {
  const { data, error } = await supabase.from("users").insert(user).select();
  if (error) {
    console.error("Error adding user:", error);
    return null;
  }
  return data;
};
