import { motion } from "framer-motion";
import { Mail, Linkedin, Github, Instagram } from "lucide-react";
import { useTranslation } from "react-i18next";

const Developer = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-background">
      <div className="container mx-auto px-4 flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-full max-w-[420px] bg-card text-card-foreground rounded-3xl overflow-hidden shadow-2xl border border-border/50 group"
        >
          {/* Card Header Gradient */}
          <div className="h-32 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
            {/* Decorative animated patterns */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <span className="text-white text-xs font-black tracking-widest uppercase mb-4 drop-shadow-md">
              {t('nav.developer')}
            </span>
          </div>

          {/* Profile Picture Overlap */}
          <div className="flex justify-center -mt-16 relative z-10">
            <div className="relative">
              {/* Profile Image Border Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full blur opacity-45 group-hover:opacity-75 transition duration-300"></div>
              <img
                src="/developer.jpg"
                alt="Md. Saiful Rehaman"
                className="relative h-28 w-28 rounded-full object-cover border-4 border-card bg-card shadow-lg"
              />
            </div>
          </div>

          {/* Card Body */}
          <div className="px-6 pb-8 pt-4 flex flex-col items-center text-center">
            {/* Developer Name */}
            <h2 className="text-2xl font-bold font-display text-primary tracking-wide mb-1 group-hover:text-indigo-400 transition-colors duration-300">
              Md.Saiful Rehaman
            </h2>
            
            {/* Roll number */}
            <p className="text-sm font-semibold text-foreground/80 font-mono tracking-wider mb-1">
              24211A05BH
            </p>

            {/* Department / Branch */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              CSE [2024-2028]
            </p>

            {/* Institution */}
            <p className="text-xs text-muted-foreground font-medium italic mb-6">
              B V Raju Institute of Technology
            </p>

            {/* Social Media Links */}
            <div className="flex items-center gap-4 justify-center">
              {/* Mail */}
              <a
                href="mailto:saifulrehaman1611@gmail.com"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-sky-500 border border-zinc-200 dark:border-zinc-700/50 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 transition-all duration-300 transform hover:scale-110 shadow-sm hover:shadow-sky-500/25"
                title="Email"
              >
                <Mail className="h-5 w-5" />
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/saiful-rehaman-793781323/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-blue-600 border border-zinc-200 dark:border-zinc-700/50 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all duration-300 transform hover:scale-110 shadow-sm hover:shadow-blue-500/25"
                title="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/SaifulRehaman-16"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-neutral-800 dark:text-neutral-200 border border-zinc-200 dark:border-zinc-700/50 hover:bg-neutral-800 hover:text-white dark:hover:bg-neutral-200 dark:hover:text-black transition-all duration-300 transform hover:scale-110 shadow-sm hover:shadow-neutral-500/25"
                title="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/iam_saifulrehaman/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-pink-600 border border-zinc-200 dark:border-zinc-700/50 hover:bg-gradient-to-tr hover:from-yellow-500 hover:via-pink-500 hover:to-purple-600 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-sm hover:shadow-pink-500/25"
                title="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Developer;
