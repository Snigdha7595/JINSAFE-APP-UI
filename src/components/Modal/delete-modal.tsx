'use client';

import Button from '@/components/Elements/Button';
import Modal from '@/components/Modal/Modal';

interface DeleteModalProps {
  showModal: () => void;
  deleteFunc: () => void;
  disabled?: boolean;
  heading: string;
  content: string;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ showModal, deleteFunc ,disabled = false ,heading,content }) => {
  return (
    <Modal cls="d7" heading={heading} action={showModal}>
      <div className="primaryHead">{content}</div>
      <div className="admin-card custom-flex-center cmt-20">
        <Button
          type="button"
          color="primary"
          clickHandler={deleteFunc}
          customClass="m-1"
          size="w-100"
          isDisabled={disabled}
        >
          Confirm
        </Button>
        <Button
          type="button"
          color="secondary"
          varient='bordered'
          clickHandler={showModal}
          customClass="m-1"
          size="w-100"
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteModal;
