const ACCOUNTS = [
  {
    platform: "微信",
    id: "CYF8683",
  },
];

export function SocialAccounts() {
  return (
    <div className="mt-4.5">
      <h4 className="mb-3.5 font-medium text-dark dark:text-white">
        联系方式
      </h4>
      <div className="flex items-center justify-center gap-3.5">
        {ACCOUNTS.map((item) => (
          <div key={item.platform} className="hover:text-primary">
            <span className="sr-only">{item.platform}</span>
            <span>{item.platform}：{item.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
