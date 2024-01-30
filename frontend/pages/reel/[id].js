import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import Layout from "@/components/Layout";
import { createAxiosCookies } from "@/fn";
import { getReel } from "@/services/reel";
import { MEDIA_URL } from "@/api";
import useRequestTwo from "@/hooks/useRequestTwo";
import Share from "@/components/Share";

const VendorDetails = ({ reel }) => {
  const [isLiked, setIsLiked] = useState(reel.isLiked);
  const { loggedIn } = useSelector((state) => state.auth);

  const { request: requestLike } = useRequestTwo();

  const { request: requestShare } = useRequestTwo();

  useEffect(() => {
    if (!loggedIn) {
      setIsLiked(false);
    }
  }, [loggedIn]);

  const shareHandler = () => {
    requestShare("POST", "v1/reel/share", {
      id: reel._id,
    });
  };

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

  return (
    <Layout seoData={{ pageTitle: "Reel" }}>
      <div className="reel_box">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6">
              <div className="video_track">
                <video
                  loop=""
                  class="swiper-video reel-videoTag videoBlock"
                  preload="auto"
                  width="320"
                  height="240"
                  controls
                >
                  <source src={`${MEDIA_URL}/${reel.video}`} />
                </video>

                <div class="reelVideoActionBtn">
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
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export async function getServerSideProps(context) {
  await createAxiosCookies(context);

  const {
    query: { id },
  } = context;

  const { status, reel } = await getReel(id);

  if (!status) {
    return {
      redirect: {
        permanent: false,
        destination: `/${context.locale}`,
      },
    };
  }

  return {
    props: {
      protected: null,
      reel,
      key: new Date().toString(),
      locales: {
        ...require(`../../locales/index/${context.locale}.json`),
      },
    },
  };
}

export default VendorDetails;
