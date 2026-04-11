import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plane, Twitter, Instagram, Github } from "lucide-react";

const Footer = () => {
  const { t } = useTranslation();
  return (
  <footer className="relative z-20 border-t border-border bg-card/95 backdrop-blur-md">
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Plane className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">
              Travel <span className="text-gradient">Planner</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {t('footer.tagline')}
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
        {[
          { title: t('footer.col_product'), links: [t('footer.link_features'), t('footer.link_pricing'), t('footer.link_how')] },
          { title: t('footer.col_company'), links: [t('footer.link_about'), t('footer.link_blog'), t('footer.link_careers')] },
          { title: t('footer.col_support'), links: [t('footer.link_help'), t('footer.link_contact'), t('footer.link_privacy')] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l}>
                  <Link to="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Travel Planner. {t('footer.rights')}
      </div>
    </div>
  </footer>
  );
};

export default Footer;
