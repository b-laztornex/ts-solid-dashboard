import { Component } from "solid-js";

const Footer: Component = () => {
  return (
    <footer class="bg-light text-dark shadow">
      <div class="container py-4">
        <div class="text-center mt-5">
          <span class="text-muted small">
            © 2025{" "}
            <a href="/" class="text-decoration-none">
              Heart Analyzer™
            </a>
            . All Rights Reserved.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
