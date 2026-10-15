
import { Link } from "react-router-dom";


function Footer() {
    return (
        <footer className="bg-coffee-brown text-white p-4">
            <div className="max-w-6xl mx-auto px-4 grid gap-8 md:grid-cols-3">
                <div>
                    <h3 className="font-semibold text-lg">☕<span className="text-coffee-orange">Oro</span> Coffee Shop</h3>
                    <p className="mt-3 text-white/80">
                        Fresh Coffee scacks and simple online ordering expereince
                    </p>
                </div>
                <div>
                    <h4 className="font-semibold">Quick links</h4>
                    <ul className="mt-2 space-y-2 text-white/80">
                        <li><Link to="/menu" className="hover:text-white">Menu</Link></li>
                        <li><Link to="/menu" className="hover:text-white">Cart</Link></li>
                        <li><Link to="/menu" className="hover:text-white">Orders</Link></li>
                        <li><Link to="/contact" className="hover:text-white">Contact us</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semi-condensed">Contact</h4>
                    <ul className="mt-2 text-white/80">
                        <li>📞+251 92 821 4042</li>
                        <li>📩bikilamoroda146@gmail.com</li>
                        <li>🏠Ethiopia Jimma</li>
                    </ul>
                </div>
            </div>
            <div className="mt-6 border-t border-white/20 flex flex-col item-center">
                <p className="text-white/70 text-sm mt-4 text-center">
                    &copy; {new Date().getFullYear()} Oro Coffee Shop. All reserved.
                </p>
            </div>
        </footer>
    )
}
export default Footer;