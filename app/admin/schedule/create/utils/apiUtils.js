
import apiCall from "@/components/utils/apiCall";
import { translations } from "./translations";
import { message } from "antd";

export const fetchInitialData = async (
  token,
  t
) => {
  try {
    const [levelsRes, modulesRes, teachersRes, groupsRes] = await Promise.all([
      apiCall("get", "/api/levels/", null, { token }).catch((err) => {
        console.error("Failed to fetch levels", err);
        return { levels: [] };
      }),
      apiCall("get", "/api/modules/", null, { token }).catch((err) => {
        console.error("Failed to fetch modules", err);
        return { modules: [] };
      }),
      apiCall("get", "/api/teachers/", null, { token }).catch((err) => {
        console.error("Failed to fetch teachers", err);
        return { teachers: [] };
      }),
      apiCall("get", "/api/groups/", null, { token }).catch((err) => {
        console.error("Failed to fetch groups", err);
        return { groups: [] };
      }),
    ]);

    const levels = Array.isArray(
      levelsRes?.levels || levelsRes?.data?.levels || levelsRes
    )
      ? levelsRes.levels || levelsRes.data?.levels || levelsRes
      : [];
    const modules = Array.isArray(
      modulesRes?.modules || modulesRes?.data?.modules || modulesRes
    )
      ? modulesRes.modules || modulesRes.data?.modules || modulesRes
      : [];
    const teachers = Array.isArray(
      teachersRes?.teachers || teachersRes?.data?.teachers || teachersRes
    )
      ? teachersRes.teachers || teachersRes.data?.teachers || teachersRes
      : [];
    const groups = Array.isArray(
      groupsRes?.groups || groupsRes?.data?.groups || groupsRes
    )
      ? groupsRes.groups || groupsRes.data?.groups || groupsRes
      : [];

    message.success(t.success.loadData);
    return { levels, modules, teachers, groups };
  } catch (error) {
    console.error("Unexpected error during data load", error);
    message.error(t.errors.loadDataFailed);
    throw error;
  }
};
