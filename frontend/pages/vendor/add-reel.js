import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import Select from "react-select";
import { useDropzone } from "react-dropzone";
import { useTranslations } from "next-intl";

import useRequest from "@/hooks/useRequest";
import Layout from "@/components/Vendor/Layout";

import { createAxiosCookies } from "@/fn";

const AddReel = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    setValue,
    unregister,
    watch,
    getValues,
    control,
    setError,
  } = useForm();

  const router = useRouter();

  const t = useTranslations("Index");

  const [mediaFile, setMediaFile] = useState(null); //media in binary
  const [previewMediaFile, setPreviewMediaFile] = useState(null);

  const { request, response } = useRequest();

  const { getRootProps, getInputProps } = useDropzone({
    accept: "video/*",
    multiple: false,
    onDrop: (acceptedFiles) => {
      mediaViewHandler(acceptedFiles);
    },
  });

  useEffect(() => {
    if (response) {
      if (response.status) {
        toast.success(response.message);
        router.push("/vendor/reels");
      } else {
        toast.success(response.message);
      }
    }
  }, [response]);

  const mediaViewHandler = (acceptedFiles) => {
    for (let i = 0; i < acceptedFiles.length; i++) {
      const media = acceptedFiles[i];
      const previewMedia = URL.createObjectURL(media);

      setMediaFile(media);
      setPreviewMediaFile(previewMedia);
    }
  };

  const onSubmit = (data) => {
    if (!mediaFile) {
      toast.error(t("Please upload video"));
      return;
    }

    const formData = new FormData();

    formData.append("status", data.status.value);
    formData.append("isActive", data.isActive.value);

    formData.append("media", mediaFile);

    request("POST", "v1/vendor/reel", formData);
  };

  const onErrors = (errors) => {};

  return (
    <>
      <Layout seoData={{ pageTitle: t("Add Reel - Noonmar") }}>
        <div className="main_content listingContainer">
          <div className="dash-titles">
            <h2 className="dash-h2">{t("Add Reel")}</h2>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="dashCard">
                <h3 className="subTitles">{t("Add Video")}</h3>
                <div className="upload-section">
                  {/* Uploader Dropzone */}
                  <form id="zdrop" className="fileuploader center-align">
                    <div
                      {...getRootProps({ className: "dropzone" })}
                      id="upload-label"
                    >
                      <i className="material-icons">
                        <svg
                          width={58}
                          height={58}
                          viewBox="0 0 58 58"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_1_1540)">
                            <path
                              d="M42.1769 57.9992C41.7709 57.9992 41.3553 57.9485 40.9444 57.8397L3.57552 47.8323C1.01386 47.1266 -0.513477 44.4731 0.158357 41.9115L4.87327 24.3375C5.04727 23.6922 5.70944 23.3176 6.35227 23.482C6.99752 23.6535 7.37936 24.3181 7.20777 24.961L2.49527 42.5301C2.15936 43.811 2.92786 45.145 4.21111 45.5002L41.5655 55.5028C42.8488 55.8411 44.1731 55.0775 44.5066 53.8015L46.394 46.8076C46.568 46.1624 47.2302 45.7781 47.8754 45.9545C48.5207 46.1285 48.9001 46.7931 48.7285 47.436L46.8435 54.4201C46.2756 56.5709 44.3181 57.9992 42.1769 57.9992Z"
                              fill="#6CB9FF"
                            />
                            <path
                              d="M53.168 43.5007H14.5013C11.8357 43.5007 9.66797 41.3329 9.66797 38.6673V9.66732C9.66797 7.00173 11.8357 4.83398 14.5013 4.83398H53.168C55.8336 4.83398 58.0013 7.00173 58.0013 9.66732V38.6673C58.0013 41.3329 55.8336 43.5007 53.168 43.5007ZM14.5013 7.25065C13.1697 7.25065 12.0846 8.33573 12.0846 9.66732V38.6673C12.0846 39.9989 13.1697 41.084 14.5013 41.084H53.168C54.4996 41.084 55.5846 39.9989 55.5846 38.6673V9.66732C55.5846 8.33573 54.4996 7.25065 53.168 7.25065H14.5013Z"
                              fill="#6CB9FF"
                            />
                            <path
                              d="M21.7513 21.7507C19.0857 21.7507 16.918 19.5829 16.918 16.9173C16.918 14.2517 19.0857 12.084 21.7513 12.084C24.4169 12.084 26.5846 14.2517 26.5846 16.9173C26.5846 19.5829 24.4169 21.7507 21.7513 21.7507ZM21.7513 14.5007C20.4197 14.5007 19.3346 15.5857 19.3346 16.9173C19.3346 18.2489 20.4197 19.334 21.7513 19.334C23.0829 19.334 24.168 18.2489 24.168 16.9173C24.168 15.5857 23.0829 14.5007 21.7513 14.5007Z"
                              fill="#6CB9FF"
                            />
                            <path
                              d="M11.0449 40.9144C10.7355 40.9144 10.4262 40.796 10.1894 40.5616C9.71813 40.0903 9.71813 39.3243 10.1894 38.853L21.6033 27.4391C22.9711 26.0713 25.3612 26.0713 26.729 27.4391L30.1269 30.8369L39.5325 19.5511C40.2165 18.7318 41.2218 18.2558 42.2924 18.2461H42.319C43.3775 18.2461 44.3804 18.7053 45.0715 19.51L57.7107 34.2565C58.1457 34.7616 58.0877 35.5253 57.5802 35.9603C57.0751 36.3953 56.3139 36.3397 55.8765 35.8298L43.2373 21.0833C43.0029 20.8126 42.679 20.6628 42.319 20.6628C42.0676 20.641 41.6254 20.815 41.391 21.0978L31.137 33.401C30.9195 33.662 30.603 33.8191 30.2622 33.8336C29.919 33.8578 29.5928 33.7224 29.3535 33.4808L25.0205 29.1477C24.5637 28.6933 23.7686 28.6933 23.3119 29.1477L11.898 40.5616C11.6635 40.796 11.3542 40.9144 11.0449 40.9144Z"
                              fill="#6CB9FF"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_1_1540">
                              <rect width={58} height={58} fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </i>
                      <span className="tittle">{t("Upload / Drag video")}</span>

                      <input {...getInputProps()} />
                    </div>
                  </form>
                  {/* Preview collection of uploaded documents */}
                  <div
                    className="preview-container"
                    style={{ visibility: "visible" }}
                  >
                    <div className="preview-data" id="previews">
                      {previewMediaFile && (
                        <div
                          className="preview-item clearhack valign-wrapper item-template"
                          id="zdrop-template"
                        >
                          <div className="zdrop-info">
                            <div className="dz-thumbs">
                              <span className="preview">
                                <video
                                  key={previewMediaFile}
                                  loop
                                  class="swiper-video reel-videoTag"
                                  preload="auto"
                                  width="320"
                                  height="240"
                                  controls
                                >
                                  <source src={previewMediaFile} />
                                </video>
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* upload-section END */}
              </div>
            </div>
            {/* dashcard END */}
            {/* Product Details Start */}
            <div className="col-md-8">
              <div className="dashCard pb-0">
                <h3 className="subTitles">{t("Reel Details")}</h3>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>{t("Status")}</label>

                      <Controller
                        className="form-control form-control-solid form-control-lg mb-10 col-4"
                        control={control}
                        name="status"
                        rules={{ required: "This field is required" }}
                        render={({ field: { onChange, value, ref } }) => {
                          return (
                            <Select
                              onChange={onChange}
                              options={[
                                { label: t("Published"), value: "Published" },
                                { label: t("Draft"), value: "Draft" },
                              ]}
                              placeholder={t("Select Status")}
                              defaultValue={[]}
                              value={value}
                              className="form-select- form-control- dark-form-control libSelect"
                            />
                          );
                        }}
                      />

                      {errors.status && (
                        <span className="text-danger">
                          {t(errors.status.message)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label>{t("Active Status")}</label>

                      <Controller
                        className="form-control form-control-solid form-control-lg mb-10 col-4"
                        control={control}
                        name="isActive"
                        rules={{ required: "This field is required" }}
                        render={({ field: { onChange, value, ref } }) => {
                          return (
                            <Select
                              onChange={onChange}
                              options={[
                                { label: t("Active"), value: true },
                                { label: t("Inactive"), value: false },
                              ]}
                              placeholder={t("Select Active Status")}
                              defaultValue={[]}
                              value={value}
                              className="form-select- form-control- dark-form-control libSelect"
                            />
                          );
                        }}
                      />

                      {errors.isActive && (
                        <span className="text-danger">
                          {t(errors.isActive.message)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Other Details Start*/}
            <div className="col-md-12">
              <div className="dashCard">
                <div className="row">
                  <div className="draftProductButtons">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      onClick={handleSubmit(onSubmit, onErrors)}
                    >
                      {t("Add Reel")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export async function getServerSideProps(context) {
  await createAxiosCookies(context);

  return {
    props: {
      protected: true,
      userTypes: ["vendor"],
      locales: {
        ...require(`../../locales/index/${context.locale}.json`),
      },
    },
  };
}

export default AddReel;
