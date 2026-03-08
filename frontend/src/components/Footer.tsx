export default function Footer() {
  return (
    <footer className="w-full py-6 px-4 border-t border-white/10 backdrop-blur-sm bg-black/20 relative z-10">
      <div className="container mx-auto text-center space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-white/70">
          <a
            href="https://sites.google.com/view/frequencyverseapp/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/90 underline underline-offset-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent rounded px-1"
          >
            Privacy Policy
          </a>
        </div>
        <p className="text-sm text-white/60">
          © 2026. Built with ❤️ using{" "}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/80 transition-colors duration-200 underline underline-offset-2"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
