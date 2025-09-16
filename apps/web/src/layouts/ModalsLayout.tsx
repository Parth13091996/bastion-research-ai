import AddMemberModal from "@/components/core/common/Modals/AddMemberModal";
import ProjectInfoModal from "@/components/core/common/Modals/ProjectInfoModal";
import EditMemberModal from "@/components/core/common/Modals/EditMemberModal";

const ModalsLayout = () => {
  return (
    <>
      <ProjectInfoModal />
      <AddMemberModal />
      <EditMemberModal />
    </>
  );
};

export default ModalsLayout;
