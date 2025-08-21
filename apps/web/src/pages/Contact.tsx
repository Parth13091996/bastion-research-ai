import React, { useState } from "react";
import BackgroundShapes from "../components/generic/framer-motion.tsx";
import {
  MapPin,
  Mail,
  Phone,
  Send,
  Twitter,
  Linkedin,
  Youtube,
} from "lucide-react";
import { motion } from "framer-motion";

const colors = {
  red: "#C00000",
  blue: "#1C2852",
  beige: "#C4B696",
  light: "#E6E6E6",
};

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: "Research Ally",
    message: "",
    notRobot: false,
  });

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.notRobot) {
      alert("Please confirm you are not a robot.");
      return;
    }
    console.log("Contact form submitted:", form);
    alert("Thanks. Your message has been sent.");
    setForm({
      name: "",
      email: "",
      phone: "",
      category: "Research Ally",
      message: "",
      notRobot: false,
    });
  };

  return (
    <div>
      <BackgroundShapes />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-2">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-semibold tracking-tight"
          style={{ color: colors.blue }}
        >
          Contact Bastion Research
        </motion.h1>
        <p className="mt-2 text-sm md:text-base text-gray-600">
          We typically respond within one business day.
        </p>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard
            icon={<MapPin className="w-6 h-6" />}
            title="Location"
            lines={["Surat, Gujarat, India"]}
          />
          <InfoCard
            icon={<Mail className="w-6 h-6" />}
            title="Email us"
            lines={["connect@bastionresearch.in"]}
          />
          <InfoCard
            icon={<Phone className="w-6 h-6" />}
            title="Phone number"
            lines={["+91 98765 43210"]}
          />
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white border rounded-2xl p-6 shadow-lg"
            style={{ borderColor: colors.light }}
          >
            <h2
              className="text-xl font-semibold"
              style={{ color: colors.blue }}
            >
              Send us a message
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Tell us a bit about yourself and what you are looking for.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Name"
                  htmlFor="name"
                  required
                  input={
                    <input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2"
                      style={{ borderColor: colors.light }}
                      placeholder="Your full name"
                      required
                    />
                  }
                />

                <Field
                  label="Email"
                  htmlFor="email"
                  required
                  input={
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={onChange}
                      className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2"
                      style={{ borderColor: colors.light }}
                      placeholder="name@example.com"
                      required
                    />
                  }
                />
              </div>

              <Field
                label="Phone"
                required
                htmlFor="phone"
                input={
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={onChange}
                    className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.light }}
                    placeholder="e.g., +91 98765 43210"
                  />
                }
              />

              <Field
                label="Category"
                htmlFor="category"
                required
                input={
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={onChange}
                    className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 bg-white"
                    style={{ borderColor: colors.light }}
                  >
                    <option>Research Ally</option>
                    <option>Bastion CORE</option>
                    <option>Others</option>
                  </select>
                }
              />

              <Field
                label="Message"
                htmlFor="message"
                required
                input={
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={onChange}
                    className="w-full rounded-xl border px-3 py-2 h-36 resize-y focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.light }}
                    placeholder="How can we help?"
                  />
                }
              />

              <div className="flex items-center gap-3">
                <input
                  id="notRobot"
                  name="notRobot"
                  type="checkbox"
                  checked={form.notRobot}
                  onChange={onChange}
                  className="h-5 w-5 rounded-md border"
                  style={{ accentColor: colors.red, borderColor: colors.light }}
                />
                <label htmlFor="notRobot" className="text-sm text-gray-700">
                  I am not a robot
                </label>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-white font-medium shadow-lg hover:opacity-95"
                style={{ background: colors.red }}
              >
                <Send className="w-4 h-4" />
                SEND
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-2xl overflow-hidden border shadow-lg h-full"
            style={{ borderColor: colors.light }}
          >
            <iframe
              title="Bastion Research Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3720.70269747765!2d72.79522761070062!3d21.16422668043798!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be053087a8dc30b%3A0x759eceffd1da1ff!2sBastion%20Research!5e0!3m2!1sen!2sus!4v1755634209831!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: 420 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </section>
      <section className="border-t" style={{ borderColor: colors.light }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3
                className="text-lg font-semibold"
                style={{ color: colors.blue }}
              >
                Connect with us
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Follow Bastion Research for research notes, updates, and events.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <SocialButton
                href="https://x.com/bastionresearch"
                label="Twitter"
                icon={<Twitter className="w-4 h-4" />}
              />
              <SocialButton
                href="https://www.linkedin.com/company/bastion-research-house"
                label="LinkedIn"
                icon={<Linkedin className="w-4 h-4" />}
              />
              <SocialButton
                href="https://www.youtube.com/@BastionResearch"
                label="YouTube"
                icon={<Youtube className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ icon, title, lines }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl border bg-white p-5 shadow-lg h-full"
      style={{ borderColor: colors.light }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: colors.light }}
        >
          <span style={{ color: colors.red }}>{icon}</span>
        </div>
        <div>
          <h4 className="font-semibold" style={{ color: colors.blue }}>
            {title}
          </h4>
          <div className="mt-1 text-sm text-gray-700 space-y-0.5">
            {lines.map((l, i) => (
              <p key={i}>{l}</p>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Field({ label, htmlFor, required, input }) {
  return (
    <label className="block">
      <span className="text-sm font-medium" style={{ color: colors.blue }}>
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      <div className="mt-1">{input}</div>
    </label>
  );
}

function SocialButton({ href, label, icon }) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-white shadow-lg hover:opacity-95"
      style={{ background: colors.red }}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}
