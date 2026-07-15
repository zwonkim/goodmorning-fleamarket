import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-10 text-text-primary">
      <div className="w-full max-w-sm text-center">
        <p className="font-mochiy text-4xl tracking-[-0.03em] text-[#FFD966]">Good <br/>Morning</p>

        <div className="mx-auto mt-8 flex h-40 w-40 items-center justify-center rounded-full bg-sunny/15">
          <img
            src="/assets/mascot/sun_03_wave.svg"
            alt="Good Morning mascot"
            className="h-40 w-40"
          />
        </div>

        <h1 className="mt-8 text-2xl font-bold">안녕하세요!</h1>
        <p className="mt-2 text-sm text-text-secondary">굿모닝 플리마켓에 오신 것을 환영해요</p>

        <div className="mt-8 text-left">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
