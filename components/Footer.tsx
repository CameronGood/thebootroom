export default function Footer() {
  return (
    <footer className="bg-[#2B2D30] border-t border-[#F5E4D0]/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-[#F4F4F4]/80">
          <p>
            &copy; {new Date().getFullYear()} TheBootRoom. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
