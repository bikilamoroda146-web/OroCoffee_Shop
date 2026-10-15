import { useState } from 'react';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'service_ayhsdx9';
const EMAILJS_TEMPLATE_ID = 'template_etr96mx';
const EMAILJS_PUBLIC_KEY = 'QWbMyj7RDkKsp9vPB';

function Contact() {
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSending, setIsSending] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setIsSending(true);
        setStatus({ type: '', message: '' });

        const form = event.currentTarget;
        const formData = new FormData(form);

        try {
            await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                {
                    from_name: formData.get('name'),
                    from_email: formData.get('email'),
                    subject: formData.get('subject'),
                    message: formData.get('message'),
                },
                EMAILJS_PUBLIC_KEY
            );

            setStatus({
                type: 'success',
                message: 'Your message has been sent successfully!'
            });
            form.reset();
        } catch (error) {
            console.error('EmailJS error:', error);
            setStatus({
                type: 'error',
                message: 'Something went wrong. Please try again later.'
            });
        } finally {
            setIsSending(false);
        }
    }

    return (
        <main className="max-w-3xl mx-auto px-4 py-12">
            <h1 className="text-4xl text-center font-bold text-coffee-orange">Contact us</h1>
            <p className="mt-3 mb-8 text-center text-gray-600">
                Questions or feedback? Send us a message and we’ll get back to you.
            </p>

            <form
                onSubmit={handleSubmit}
                className="space-y-5 rounded-2xl border border-coffee-orange bg-white p-6 shadow-sm sm:p-8"
            >
                <div>
                    <label htmlFor="contact-name" className="mb-1 block font-semibold text-coffee-brown">
                        Name
                    </label>
                    <input
                        id="contact-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-coffee-orange focus:outline-none focus:ring-2 focus:ring-coffee-orange/30"
                    />
                </div>

                <div>
                    <label htmlFor="contact-email" className="mb-1 block font-semibold text-coffee-brown">
                        Email
                    </label>
                    <input
                        id="contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-coffee-orange focus:outline-none focus:ring-2 focus:ring-coffee-orange/30"
                    />
                </div>

                <div>
                    <label htmlFor="contact-subject" className="mb-1 block font-semibold text-coffee-brown">
                        Subject
                    </label>
                    <input
                        id="contact-subject"
                        name="subject"
                        type="text"
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-coffee-orange focus:outline-none focus:ring-2 focus:ring-coffee-orange/30"
                    />
                </div>

                <div>
                    <label htmlFor="contact-message" className="mb-1 block font-semibold text-coffee-brown">
                        Message
                    </label>
                    <textarea
                        id="contact-message"
                        name="message"
                        rows="6"
                        required
                        className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 focus:border-coffee-orange focus:outline-none focus:ring-2 focus:ring-coffee-orange/30"
                    />
                </div>

                {status.message && (
                    <p
                        className={status.type === 'success' ? 'text-sm text-green-700' : 'text-sm text-red-700'}
                        role="alert"
                    >
                        {status.message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={isSending}
                    className="w-full rounded-lg bg-coffee-orange px-6 py-3 font-bold text-white transition hover:bg-coffee-brown disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSending ? 'Sending...' : 'Send message'}
                </button>
            </form>
        </main>
    );
}

export default Contact;
