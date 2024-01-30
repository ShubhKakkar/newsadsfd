import React, { useEffect, useRef, useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper";
import { useSelector } from "react-redux";

import Share from "./Share";
import { isVideoPlaying } from "@/fn";
import { MEDIA_URL } from "@/api";
import useRequestTwo from "@/hooks/useRequestTwo";
import { Button, Modal } from "react-bootstrap";

const Reel = ({ reel, loggedIn, videoRef }) => {
  const [isLiked, setIsLiked] = useState(reel.isLiked);
  const { request: requestLike } = useRequestTwo();

  const { request: requestShare } = useRequestTwo();

  const [show, setShow] = useState(false);

  const playVideoRef = useRef(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const likeHandler = () => {
    if (!loggedIn) {
      return;
    }

    requestLike("POST", `v1/reel/${isLiked ? "unlike" : "like"}`, {
      id: reel._id,
    }).then((response) => {
      if (response.status) {
        setIsLiked((prev) => !prev);
      }
    });
  };

  const shareHandler = () => {
    requestShare("POST", "v1/reel/share", {
      id: reel._id,
    });
  };

  return (
    <>
      <div class="reelsCard reelvideo swiper-reel-id" reelid={reel._id}>
        <div class="reel-videoCard" onClick={(e) => setShow(true)}>
          <video
            class="swiper-video reel-videoTag"
            src={`${MEDIA_URL}/${reel.video}`}
            preload="auto"
            loop
            ref={playVideoRef}
          ></video>
        </div>
        <div
          onClick={(e) => {
            clearTimeout(videoRef.current);
          }}
          class="reelVideoActionBtn"
        >
          <a
            onClick={likeHandler}
            className={`${isLiked ? "liked" : ""}`}
            href="javascript:void(0)"
          >
            <i class="fas fa-thumbs-up"></i>
          </a>
          {/* <a href="javascript:void(0)">
        <i class="fas fa-thumbs-down"></i>
      </a> */}
          <a
            className="btn-action-filter dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            href="javascript:void(0)"
          >
            <i class="fas fa-share"></i>
          </a>
          <ul className="dropdown-menu" style={{ minWidth: "100px" }}>
            <li>
              <div className="action_radios">
                <div className="shareBtn">
                  <Share
                    data={{
                      shareUrl: reel.shareUrl,
                      name: "Reel",
                      hashTag: "#reel #noonmar",
                    }}
                    shareHandler={shareHandler}
                  />
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div class="reelDetailCard">
          <div class="reelUploadInfo">
            <figure class="reelUploadUser">
              <img
                src={
                  reel.isAdmin
                    ? `/assets/img/favicon/ms-icon-310x310.png`
                    : reel.vendorImage
                }
                alt="Reel Upload"
              />
            </figure>
            <span class="reelUploadName">{reel.vendorName}</span>
          </div>
        </div>

        <Modal
          className="swiper_moadl_reels"
          centered
          show={show}
          onHide={handleClose}
        >
          <Modal.Header closeButton>
            {/* <Modal.Title>
              {" "}
              <span class="reelUploadName text-dark">{reel.vendorName}</span>
            </Modal.Title> */}
          </Modal.Header>
          <Modal.Body>
            <div className="main_reel_box">
              <div class="reel-videoCard">
                <video
                  class="swiper-video reel-videoTag"
                  src={`${MEDIA_URL}/${reel.video}`}
                  preload="auto"
                  loop
                  autoPlay
                ></video>
              </div>
              <div
                onClick={(e) => {
                  clearTimeout(videoRef.current);
                }}
                class="reelVideoActionBtn"
              >
                <a
                  onClick={likeHandler}
                  className={`${isLiked ? "liked" : ""}`}
                  href="javascript:void(0)"
                >
                  <i class="fas fa-thumbs-up"></i>
                </a>

                <a
                  className="btn-action-filter dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  href="javascript:void(0)"
                >
                  <i class="fas fa-share"></i>
                </a>
                <ul className="dropdown-menu" style={{ minWidth: "100px" }}>
                  <li>
                    <div className="action_radios">
                      <div className="shareBtn">
                        <Share
                          data={{
                            shareUrl: reel.shareUrl,
                            name: "Reel",
                            hashTag: "#reel #noonmar",
                          }}
                          shareHandler={shareHandler}
                        />
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div class="reelDetailCard">
                <div class="reelUploadInfo">
                  <figure class="reelUploadUser">
                    <img
                      // src="/assets/img/user5.jpg"
                      src={
                        reel.isAdmin
                          ? `/assets/img/favicon/ms-icon-310x310.png`
                          : reel.vendorImage
                      }
                      alt="Reel Upload"
                    />
                  </figure>
                  <span class="reelUploadName">{reel.vendorName}</span>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

const SwiperReel = ({ reels }) => {
  const videoRef = useRef(null);

  const { request: requestView } = useRequestTwo();
  const { loggedIn } = useSelector((state) => state.auth);

  const [show, setShow] = useState(false);

  return (
    <>
      <div className="ReelsRow-">
        {/* <div class="swiper-container"> */}
        <Swiper
          spaceBetween={10}
          pagination={true}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className="swiper-container"
          direction="horizontal"
          loop={true}
          centeredSlides={true}
          speed={2000}
          // autoplay={{
          //   delay: 3000,
          //   disableOnInteraction: false,
          // }}
          breakpoints={{
            640: {
              slidesPerView: 1.8,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 3.2,
              spaceBetween: 40,
            },
            1024: {
              slidesPerView: 5,
              spaceBetween: 50,
            },
          }}
          // onSlideChange={(swiper) => {
          //   const previousSlide = swiper.slides[swiper.previousIndex];
          //   const previousVideo =
          //     previousSlide.querySelector(".swiper-video");

          //   if (previousVideo) {
          //     previousVideo.pause();
          //   }

          //   const activeSlide = swiper.slides[swiper.activeIndex];

          //   const activeVideo =
          //     activeSlide.querySelector(".swiper-video");

          //   if (activeVideo) {
          //     activeVideo.play();
          //   }
          // }}
          // onSwiper={setSwiper}
          onClick={(swiper) => {
            const clickedSlide = swiper.clickedSlide;

            if (!clickedSlide) {
              return;
            }

            if (show) {
              clickedSlide.pause();
            }

            const slides = swiper.slides.filter(
              (_, idx) => idx !== swiper.clickedIndex
            );

            videoRef.current = setTimeout(() => {
              slides.forEach((slide) => {
                const video = slide.querySelector(".swiper-video");

                if (video) {
                  video.pause();
                }
              });

              const clickedVideo = clickedSlide.querySelector(".swiper-video");

              if (isVideoPlaying(clickedVideo)) {
                clickedVideo.pause();
              } else {
                if (loggedIn && clickedVideo.currentTime == 0) {
                  //add views
                  const clickedReel =
                    clickedSlide.querySelector(".swiper-reel-id");
                  const reelid = clickedReel.getAttribute("reelid");

                  requestView("POST", "v1/reel/view", {
                    id: reelid,
                  });
                }
                // clickedVideo.play();
              }
            }, 0);
          }}
        >
          <div class="swiper-wrapper">
            {reels.map((reel) => (
              <>
                <SwiperSlide key={reel._id}>
                  <Reel loggedIn={loggedIn} reel={reel} videoRef={videoRef} />
                </SwiperSlide>
              </>
            ))}
          </div>
        </Swiper>
        {/* </div> */}
      </div>
    </>
  );
};

export default SwiperReel;
