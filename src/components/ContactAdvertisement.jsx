import { Mail, MessageCircle } from 'lucide-react';

export default function ContactAdvertisement() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Get In Touch</h2>
          <p className="text-blue-100">Connect with us for more information</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Instagram */}
          <a
            href="https://instagram.com/zeeshanazam.1"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-md rounded-lg p-6 text-center transition transform hover:scale-105 cursor-pointer"
          >
            <div className="flex justify-center mb-4">
              <Mail className="w-12 h-12 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Instagram</h3>
            <p className="text-blue-100">@zeeshanazam.1</p>
            <p className="text-sm text-blue-200 mt-2">Follow us for updates</p>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/923221318878"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-md rounded-lg p-6 text-center transition transform hover:scale-105 cursor-pointer"
          >
            <div className="flex justify-center mb-4">
              <MessageCircle className="w-12 h-12 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">WhatsApp</h3>
            <p className="text-blue-100">+92 322 1318878</p>
            <p className="text-sm text-blue-200 mt-2">Message us directly</p>
          </a>
        </div>

        <div className="text-center mt-8 text-blue-100 text-sm">
          <p>Questions or suggestions? Reach out - we'd love to hear from you!</p>
        </div>
      </div>
    </section>
  );
}
