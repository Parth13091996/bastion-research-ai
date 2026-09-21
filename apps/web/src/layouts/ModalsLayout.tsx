import AddMemberModal from "@/components/core/common/Modals/AddMemberModal";
import ProjectInfoModal from "@/components/core/common/Modals/ProjectInfoModal";
import EditMemberModal from "@/components/core/common/Modals/EditMemberModal";
import ConfirmationModal from "@/components/core/common/Modals/ConfirmationModal";

const ModalsLayout = () => {
  return (
    <>
      <ProjectInfoModal />
      <AddMemberModal />
      <EditMemberModal />
      <ConfirmationModal />
    </>
  );
};

export default ModalsLayout;
