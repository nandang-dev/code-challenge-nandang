import { SwapForm } from './components/SwapForm';

function App() {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-fuchsia-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-32 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl" />
      <SwapForm />
    </div>
  );
}

export default App;
