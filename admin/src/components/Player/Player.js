import React from "react";
import Modal from "react-modal";

import { Link } from "react-router-dom";
import { API } from "../../constant/api";

const Player = (props) => {
  const { open, handleCloseVideoModal, url } = props;

  return (
    <Modal
      isOpen={open}
      ariaHideApp={false}
        className="videoModal"
      onRequestClose={handleCloseVideoModal}
    >
      <>
        <div class="modal-header_">
        <h3 class="modal-title fs-5 mb-3">Reel</h3>
      </div>
      <div className="text-center">
        <video controls className="modalVideo">
          <source
            src={`${API.PORT}/${url}`}
            type="video/mp4"
            // width="100%"
            // height="100%"
          />
        </video>
        </div>
      </>
    </Modal>
  );
};

export default Player;
