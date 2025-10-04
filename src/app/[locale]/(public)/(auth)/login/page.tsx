export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="mb-4 text-2xl font-bold">Login Page</h1>
      <form className="flex w-full max-w-sm flex-col gap-4">
        <input
          type="text"
          placeholder="Username"
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          className="w-full rounded bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
        >
          Login
        </button>
      </form>
    </div>
  );
}
