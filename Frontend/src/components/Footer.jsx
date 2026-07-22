import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer
      className={`mt-20 border-t border-gray-800 ${
        localStorage.getItem("theme") === "purple"
          ? "bg-violet-700"
          : "bg-slate-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-8 py-14">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Logo */}
          <div>
            <h2
              className={`text-3xl font-bold ${
                localStorage.getItem("theme") === "purple"
                  ? "text-violet-200"
                  : "text-white"
              }`}
            >
              AnimeHub
            </h2>

            <p
              className={`mt-4 ${
                localStorage.getItem("theme") === "purple"
                  ? "text-violet-100"
                  : "text-gray-300"
              }`}
            >
              Stream your favorite anime anytime, anywhere.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h3
              className={`font-bold mb-4 ${
                localStorage.getItem("theme") === "purple"
                  ? "text-violet-200"
                  : "text-white"
              }`}
            >
              Browse
            </h3>

            <div
              className={`flex flex-col gap-3 ${
                localStorage.getItem("theme") === "purple"
                  ? "text-violet-100"
                  : "text-gray-300"
              }`}
            >
              <Link
                to="/"
                onClick={() => {
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
              >
                Home
              </Link>

              <Link
                to="/"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Trending
              </Link>

              <Link
                to="/"
                onClick={() =>
                  window.scrollTo({ top: 500, behavior: "smooth" })
                }
              >
                Popular Anime
              </Link>

              <Link
                to="/"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Genres
              </Link>
            </div>
          </div>

          {/* Account */}
          <div>
            <h3
              className={`font-bold mb-4 ${
                localStorage.getItem("theme") === "purple"
                  ? "text-violet-200"
                  : "text-white"
              }`}
            >
              Account
            </h3>

            <div
              className={`flex flex-col gap-3 ${
                localStorage.getItem("theme") === "purple"
                  ? "text-violet-100"
                  : "text-gray-300"
              }`}
            >
              <Link to="/profile">Profile</Link>
              <Link to="/profile?tab=lists">My List</Link>
              <Link to="/profile?tab=settings">Settings</Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3
              className={`font-bold mb-4 ${
                localStorage.getItem("theme") === "purple"
                  ? "text-violet-200"
                  : "text-white"
              }`}
            >
              Support
            </h3>

            <div
              className={`flex flex-col gap-3 ${
                localStorage.getItem("theme") === "purple"
                  ? "text-violet-100"
                  : "text-gray-300"
              }`}
            >
              <Link to="/profile?tab=settings">Help Center</Link>
              <Link to="/profile?tab=settings">Privacy Policy</Link>
              <Link to="/profile?tab=settings">Terms of Service</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-violet-500 mt-12 pt-8 text-center">
          <p
            className={`${
              localStorage.getItem("theme") === "purple"
                ? "text-violet-300"
                : "text-gray-400"
            }`}
          >
            © 2026 AnimeHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
