import { motion } from "framer-motion";
import { Heart, CreditCard, Shield } from "lucide-react";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import SEO from "@/components/SEO";

const Give = () => (
  <Layout>
    <SEO 
      title="Support & Give"
      description="Support UCOCSA's mission at the University of Malawi through your offerings and donations."
    />
    <section className="py-20 bg-secondary">
      <div className="container text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-heading text-secondary-foreground">
            Give
          </h1>
          <p className="mt-4 text-secondary-foreground/70 max-w-lg mx-auto">
            Your generosity fuels the mission. Support UCOCSA's work on campus
            and beyond.
          </p>
        </motion.div>
      </div>
    </section>

    <section className="py-16">
      <div className="container max-w-4xl">
        <SectionHeading
          title="Ways to Give"
          subtitle="Choose a giving option below."
        />
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              title: "General Offering",
              desc: "Any amount to support UCOCSA's general activities",
              icon: Heart,
            },
            {
              title: "Social Welfare",
              desc: "Any amount to help those in need among ourselves.",
              icon: Shield,
            },
          ].map((option, i) => (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl bg-card border border-border text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <option.icon size={28} className="text-primary" />
              </div>
              <h3 className="font-heading text-foreground">{option.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {option.desc}
              </p>
              <button className="mt-4 px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-gold-dark transition-colors">
                Give Now
              </button>
            </motion.div>
          ))}
        </div>

        {/* Mobile Money Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 p-6 rounded-xl bg-secondary text-center"
        >
          <h3 className="font-heading text-lg text-secondary-foreground mb-3">
            Mobile Money
          </h3>
          <p className="text-sm text-secondary-foreground/70 mb-4">
            Send directly via Airtel Money or TNM Mpamba:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
            <div className="px-6 py-3 rounded-lg bg-secondary-foreground/10">
              <span className="font-medium text-secondary-foreground">
                Airtel Money:
              </span>{" "}
              <span className="text-secondary-foreground/80">0999 000 000</span>
            </div>
            <div className="px-6 py-3 rounded-lg bg-secondary-foreground/10">
              <span className="font-medium text-secondary-foreground">
                TNM Mpamba:
              </span>{" "}
              <span className="text-secondary-foreground/80">0888 000 000</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-secondary-foreground/50">
            Reference: UCOCSA + category (General Offering or Social Welfare)
          </p>
        </motion.div>
      </div>
    </section>
  </Layout>
);

export default Give;
