import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import logo from "@/assets/ucocsa-logo.png";

const Footer = () => (
  <footer className="bg-secondary text-secondary-foreground">
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <img src={logo} alt="UCOCSA" width={32} height={32} />
            <span className="font-heading text-lg">UCOCSA</span>
          </div>
          <p className="text-sm text-secondary-foreground/70">
            University of Malawi Church of Christ Students Association (UCOCSA)
            is a group of dedicated students who are members of Church of Christ.
            Working towards fellowship, career development, respect and family 
            in Christ Jesus.
          </p>
        </div>

        <div>
          <h4 className="font-heading text-sm mb-3">Quick Links</h4>
          <div className="flex flex-col gap-2 text-sm text-secondary-foreground/70">
            <Link
              to="/about"
              className="hover:text-secondary-foreground transition-colors"
            >
              About Us
            </Link>
            <Link
              to="/events"
              className="hover:text-secondary-foreground transition-colors"
            >
              Events
            </Link>
            <Link
              to="/prayer"
              className="hover:text-secondary-foreground transition-colors"
            >
              Prayer
            </Link>
            <Link
              to="/hymns"
              className="hover:text-secondary-foreground transition-colors"
            >
              Hymns
            </Link>
          </div>
        </div>

        <div>
          <h4 className="font-heading text-sm mb-3">Resources</h4>
          <div className="flex flex-col gap-2 text-sm text-secondary-foreground/70">
            <Link
              to="/resources"
              className="hover:text-secondary-foreground transition-colors"
            >
              Bible Study
            </Link>
            <Link
              to="/blog"
              className="hover:text-secondary-foreground transition-colors"
            >
              Blog
            </Link>
            <Link
              to="/give"
              className="hover:text-secondary-foreground transition-colors"
            >
              Give
            </Link>
          </div>
        </div>

        <div>
          <h4 className="font-heading text-sm mb-3">Connect</h4>
          <div className="flex flex-col gap-2 text-sm text-secondary-foreground/70">
            <a
              href="https://wa.me/265999978828"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-secondary-foreground transition-colors"
            >
              WhatsApp
            </a>
            <a
              href="mailto:ucocsa@unima.ac.mw"
              className="hover:text-secondary-foreground transition-colors"
            >
              Email Us
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-secondary-foreground/10 text-center text-xs text-secondary-foreground/50">
        <p className="flex items-center justify-center gap-1">
          © {new Date().getFullYear()} UNIMA Church of Christ. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
