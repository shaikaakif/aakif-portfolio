import { ArrowUpRight } from "@/components/ui/icons";
import { CopyEmail } from "@/components/ui/copy-email";
import { profile } from "@/content/profile";

export function ContactSection() {
  return (
    <section className="section" id="contact" aria-labelledby="contact-title">
      <div className="container">
        <div className="contact-panel">
          <div className="contact-inner">
            <div>
              <p className="eyebrow">Contact / direct line</p>
              <h2 className="contact-title" id="contact-title">
                Let&apos;s build something <em>meaningful</em> together.
              </h2>
              <p className="contact-sub">
                Open for AI product engineering, startup co-founder inquiries,
                technical collaboration, and full-stack software development.
              </p>
              <div className="contact-actions">
                <a
                  href={`mailto:${profile.email}`}
                  className="button button--light"
                >
                  Send direct email
                  <ArrowUpRight />
                </a>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="button button--outline-light"
                >
                  Connect on LinkedIn
                </a>
              </div>
            </div>

            <div className="contact-side">
              <div className="email-card">
                <a href={`mailto:${profile.email}`}>{profile.email}</a>
                <CopyEmail />
              </div>
              <div className="contact-socials">
                <a href={profile.github} target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <a href={profile.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
                <a href={profile.instagram} target="_blank" rel="noreferrer">
                  Instagram
                </a>
              </div>
              <p className="count-note">Direct email / no forms / no gatekeeping.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
