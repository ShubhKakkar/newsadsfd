import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { useSelector } from "react-redux";
import Layout from "@/components/Layout";
import useRequest from "@/hooks/useRequest";
import Newsletter from "@/components/Newsletter";

const ContactUs = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm();

  const { contactUsSettings } = useSelector((store) => store.auth);

  const { request: saveContactReq, response: saveContactRes } = useRequest();

  const onSubmit = (data) => {
    saveContactReq("POST", "v1/contact-us/create", data);
  };

  useEffect(() => {
    if (saveContactRes && saveContactRes?.status) {
      toast.success(saveContactRes?.message || "Contact-us saved");
      reset({
        name: "",
        email: "",
        phone: "",
        company: "",
        comment: "",
      });
    }
  }, [saveContactRes]);
  return (
    <Layout seoData={{ pageTitle: "Contact Us - Noonmar" }}>
      <>
        <section className="dashboard">
          <div className="container">
            <div className="breadcrumbBlock">
              <nav style={{}} aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <a href="#">Home</a>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Contact Us
                  </li>
                </ol>
              </nav>
            </div>
            <div className="ContactSection">
              <div className="row">
                <div className="col-12 col-lg-5 col-xl-4">
                  <div className="contact_add_coloum">
                    <div className="contact_title_lowerBox">
                      <h2 className="RightBlockTitle">Get in Touch</h2>
                      <ul className="contactInfo_list">
                        <li>
                          <div className="contact_icon">
                            <svg
                              aria-hidden="true"
                              focusable="false"
                              data-prefix="fas"
                              data-icon="map-marker-alt"
                              role="img"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 384 512"
                              className="svg-inline--fa fa-map-marker-alt fa-w-12"
                            >
                              <path
                                fill="currentColor"
                                d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"
                                className=""
                              />
                            </svg>
                          </div>
                          <strong> Address </strong>
                          {contactUsSettings?.address}
                        </li>
                        <li>
                          <div className="contact_icon">
                            <svg
                              aria-hidden="true"
                              focusable="false"
                              data-prefix="fas"
                              data-icon="user"
                              role="img"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 448 512"
                              className="svg-inline--fa fa-user fa-w-14"
                            >
                              <path
                                fill="currentColor"
                                d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"
                                className=""
                              />
                            </svg>
                          </div>
                          <span>
                            <a
                              href={
                                contactUsSettings?.number
                                  ? `tel:${contactUsSettings?.number}`
                                  : ""
                              }
                            >
                              {" "}
                              {contactUsSettings?.number}
                            </a>
                          </span>
                        </li>
                        <li>
                          <div className="contact_icon">
                            <svg
                              aria-hidden="true"
                              focusable="false"
                              data-prefix="fas"
                              data-icon="envelope"
                              role="img"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 512 512"
                              className="svg-inline--fa fa-envelope fa-w-16"
                            >
                              <path
                                fill="currentColor"
                                d="M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z"
                                className=""
                              />
                            </svg>
                          </div>
                          <span>
                            <a
                              href={
                                contactUsSettings?.email
                                  ? `mailto:${contactUsSettings?.email}`
                                  : ""
                              }
                            >
                              {contactUsSettings?.email}
                            </a>
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-lg-7 col-xl-8">
                  <div className="contact_form">
                    <div className="contact_form-title">
                      <h2 className="RightBlockTitle">Send a Message</h2>
                    </div>
                    <div className="contact_form_field">
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="row">
                          <div className="col-12 col-md-6">
                            <div className="form-group">
                              <label className="form-label">Name</label>
                              <input
                                type="text"
                                className="form-control dark-form-control"
                                placeholder="Name"
                                {...register("name", {
                                  required: {
                                    value: true,
                                    message: "This field is required",
                                  },
                                })}
                              />

                              {errors?.name && (
                                <span className="text-danger">
                                  {errors.name.message ||
                                    "This field is required"}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-12 col-md-6">
                            <div className="form-group">
                              <label className="form-label">Email</label>
                              <input
                                type="email"
                                className="form-control dark-form-control"
                                placeholder="Email"
                                {...register("email", {
                                  required: {
                                    value: true,
                                    message: "This field is required",
                                  },
                                  pattern: {
                                    value:
                                      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                                    message: "Please enter a valid email Id",
                                  },
                                })}
                              />
                              {errors?.email && (
                                <span className="text-danger">
                                  {errors.email.message ||
                                    "This field is required"}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-12 col-md-6">
                            <div className="form-group">
                              <label className="form-label">Company</label>
                              <input
                                type="text"
                                className="form-control dark-form-control"
                                placeholder="Company"
                                {...register("company")}
                              />
                            </div>
                          </div>
                          <div className="col-12 col-md-6">
                            <div className="form-group">
                              <label className="form-label">Phone</label>
                              <input
                                type="text"
                                className="form-control dark-form-control"
                                placeholder="Phone"
                                {...register("phone", {
                                  pattern: {
                                    value: /^[0-9]{10}$/,
                                    message:
                                      "Please provide a valid phone number.",
                                  },
                                })}
                              />
                              {errors?.phone && (
                                <span className="text-danger">
                                  {errors.phone.message ||
                                    "This field is required"}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-12 col-md-12">
                            <div className="form-group">
                              <label className="form-label">Comment</label>
                              <textarea
                                className="form-control dark-form-control"
                                placeholder="Comment ..."
                                rows={2}
                                defaultValue={""}
                                {...register("comment", {
                                  required: {
                                    value: true,
                                    message: "This field is required",
                                  },
                                })}
                              />
                              {errors?.comment && (
                                <span className="text-danger">
                                  {errors.comment.message ||
                                    "This field is required"}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-12 text-center mt-3">
                            <button
                              type="submit"
                              className="submit_button w-100"
                            >
                              Submit
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                {/* <div class="col-12">
                  <div class="mapInner_contact">
                      <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4228.272273839398!2d75.77679626144653!3d26.981494514254553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db21300000069%3A0x9a42aa9dab9c312c!2sKandarp+Tradelinks+%26+Services+Private+Limited!5e0!3m2!1sen!2sin!4v1540297520151" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
                  </div>
              </div> */}
              </div>
            </div>
          </div>
        </section>
        {/* Subscribe */}
        <Newsletter />
      </>
    </Layout>
  );
};

export default ContactUs;
