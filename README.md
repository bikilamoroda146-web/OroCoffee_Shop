# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Oro Coffee Shop demo checkout

Checkout offers Telebirr, CBE Birr, bank card, and cash on delivery as **frontend demonstrations only**. No payment provider is contacted, no payment credentials are requested, and a successful simulation is not a verified real payment.

To try the flow:

1. Start the app with `npm run dev`, create/sign in to a customer account, and add coffee to the cart.
2. Open checkout, enter delivery details, select a payment method, and choose either **Simulate success** or **Simulate failure**.
3. Review the confirmation dialog and select **Confirm & simulate**. A failed attempt keeps the cart and order reference; retrying updates the same order. Switch the next result to success to verify the confirmation screen and order-history link.
4. Use **Cancel demo payment** during a simulation or after a failure to inspect the cancelled state. The cart remains available.
5. Inspect payment method/status in `/admin/orders`. Demo payment orders are excluded from completed revenue and sales analytics.

Run `npm run lint` and `npm run build` to validate the project. The repository does not currently define a dedicated automated test runner; use the checkout steps above to exercise the success, failure, retry, cancellation, and empty-cart states.
