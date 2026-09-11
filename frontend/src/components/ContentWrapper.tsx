
const ContentWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-full background-color p-4 md:p-6 flex flex-col">
      {children}
    </div>
  )
}

export default ContentWrapper