"use client";
import React from "react";
import { FaMapMarkedAlt, FaEnvelope, FaPhone, FaClock } from "react-icons/fa";
import "./style.css";
import NavBar from "@/components/NavBar";
import * as Yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Footer from "@/components/Footer";
import axios from "axios";

function Contact() {
  const handleSubmit = async (values, actions) => {
    try {
      const { name, email, message } = values;
      const subject = `Message de votre application`;

      // <<<<<<< HEAD
      const response = await axios.post(
        "https://pfe-master-backend.vercel.app/send-email",
        {
          name,
          email,
          subject,
          message,
        }
      );
      // =======
      // const response = await axios.post(
      //   "https://pfe-master-backend.vercel.app/send-email",
      //   {
      //     name,
      //     email,
      //     subject,
      //     message,
      //   }
      // );
      // >>>>>>> 08227d00de8ebe0fbfd06a9e056f0ad17d262c57

      console.log(response.data);
      alert("Votre message a été envoyé avec succès !");
      actions.resetForm();
    } catch (error) {
      console.error(error);
      alert("Une erreur s'est produite lors de l'envoi du message.");
    }
    actions.setSubmitting(false);
  };

  return (
    <div>
      <NavBar currentScreen={2} />
      <div className="body bg-[url('/BG.jpeg')] text-black">
        <div className="contact-section">
          <div className="contact-info">
            <div>
              <FaMapMarkedAlt className="icon" />
              Address, city, Country
            </div>
            <div>
              <FaEnvelope className="icon" />
              contact@gmail.com
            </div>
            <div>
              <FaPhone className="icon" />
              +213 000000000
            </div>
            <div>
              <FaClock className="icon" />
              Ouvert de 8:00 AM à 5:00 PM
            </div>
          </div>
          <div className="contact-form">
            <h2>Contact Us</h2>
            <Formik
              initialValues={{
                name: "",
                email: "",
                message: "",
              }}
              validationSchema={Yup.object({
                name: Yup.string()
                  .min(2, "Too Short!")
                  .max(50, "Too Long!")
                  .required("Required"),
                email: Yup.string().email("Invalid email").required("Required"),
                message: Yup.string()
                  .min(2, "Too Short!")
                  .max(500, "Too Long!")
                  .required("Required"),
              })}
              onSubmit={handleSubmit}>
              {({ errors, touched, isSubmitting }) => (
                <Form>
                  <div className="input-row">
                    <div className="field-container">
                      <Field
                        name="name"
                        type="text"
                        className="text-box"
                        placeholder="Your Name"
                        required
                      />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="input-feedback"
                      />
                    </div>

                    <div className="field-container">
                      <Field
                        name="email"
                        type="email"
                        className="text-box"
                        placeholder="Your Email"
                        required
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="input-feedback"
                      />
                    </div>
                  </div>

                  <Field
                    name="message"
                    as="textarea"
                    rows="5"
                    placeholder="Your Message"
                    required
                  />
                  <ErrorMessage
                    name="message"
                    component="div"
                    className="input-feedback"
                  />

                  <button
                    type="submit"
                    className="send-btn"
                    disabled={isSubmitting}>
                    Send
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Contact;
