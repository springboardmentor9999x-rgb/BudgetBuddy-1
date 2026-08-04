import { motion } from "framer-motion";
import {
  FiShield,
  FiBarChart2,
  FiTarget,
  FiTrendingUp,
  FiCreditCard,
  FiWifi,
} from "react-icons/fi";

/* ================================
   SMALL STAT CARD
================================ */

const StatCard = ({ label, value, badge, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="
        rounded-2xl
        border
        border-white/10
        bg-white/10
        p-4
        backdrop-blur-xl
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-400">{label}</p>

          <p className="mt-1 text-lg font-bold text-white">
            {value}
          </p>
        </div>

        {badge && (
          <span
            className="
              rounded-full
              bg-emerald-400/15
              px-2
              py-1
              text-[11px]
              font-semibold
              text-emerald-300
            "
          >
            {badge}
          </span>
        )}
      </div>
    </motion.div>
  );
};

/* ================================
   FEATURE ITEM
================================ */

const Feature = ({ icon: Icon, title, description }) => {
  return (
    <div className="flex items-center gap-3">
      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          border
          border-emerald-400/20
          bg-emerald-400/10
          text-emerald-300
        "
      >
        <Icon />
      </div>

      <div>
        <p className="text-xs font-semibold text-white">
          {title}
        </p>

        <p className="mt-0.5 text-[11px] text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
};

/* ================================
   AUTH LAYOUT
================================ */

const AuthLayout = ({ children }) => {
  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-[#E8EFED]
        via-[#EDF3F1]
        to-[#E2ECE9]
        p-3
        sm:p-5
        lg:p-6
      "
    >
      <div
        className="
          mx-auto
          grid
          min-h-[calc(100vh-24px)]
          w-full
          max-w-[1500px]
          overflow-hidden
          rounded-[32px]
          shadow-[0_30px_90px_rgba(7,26,43,0.18)]

          sm:min-h-[calc(100vh-40px)]

          lg:min-h-[calc(100vh-48px)]
          lg:grid-cols-[0.95fr_1.05fr]
        "
      >
        {/* ======================================
            LEFT PANEL
        ====================================== */}

        <section
          className="
            relative
            hidden
            overflow-hidden
            bg-[#071A2B]
            px-10
            py-9

            lg:flex
            lg:flex-col

            xl:px-14
            xl:py-11
          "
        >
          {/* Emerald Glow */}

          <div
            className="
              pointer-events-none
              absolute
              -left-32
              top-20
              h-96
              w-96
              rounded-full
              bg-emerald-500/10
              blur-[100px]
            "
          />

          {/* Teal Glow */}

          <div
            className="
              pointer-events-none
              absolute
              -right-28
              bottom-10
              h-96
              w-96
              rounded-full
              bg-teal-400/10
              blur-[110px]
            "
          />

          {/* Cyan Glow */}

          <div
            className="
              pointer-events-none
              absolute
              right-10
              top-0
              h-64
              w-64
              rounded-full
              bg-cyan-500/5
              blur-[90px]
            "
          />

          {/* ==========================
              BRAND
          ========================== */}

          <motion.div
            initial={{
              opacity: 0,
              x: -15,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            className="
              relative
              z-10
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                bg-emerald-400
                text-[#071A2B]
                shadow-lg
                shadow-emerald-500/20
              "
            >
              <FiCreditCard className="text-xl" />
            </div>

            <div>
              <h1
                className="
                  text-lg
                  font-bold
                  tracking-tight
                  text-white
                "
              >
                Budget Buddy
              </h1>

              <p
                className="
                  text-[11px]
                  font-medium
                  uppercase
                  tracking-[0.18em]
                  text-emerald-300
                "
              >
                Personal Finance
              </p>
            </div>
          </motion.div>

          {/* ==========================
              HERO TEXT
          ========================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.55,
              delay: 0.08,
            }}
            className="relative z-10 mt-9"
          >
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-emerald-400/20
                bg-emerald-400/10
                px-3
                py-1.5
                text-xs
                font-semibold
                text-emerald-300
              "
            >
              <FiTrendingUp />

              Smarter financial habits
            </div>

            <h2
              className="
                mt-5
                max-w-lg
                text-4xl
                font-bold
                leading-[1.08]
                tracking-[-0.035em]
                text-white

                xl:text-[46px]
              "
            >
              Master your money.

              <span className="block text-emerald-400">
                Build your future.
              </span>
            </h2>

            <p
              className="
                mt-4
                max-w-md
                text-sm
                leading-6
                text-slate-400
              "
            >
              One simple place to understand your spending,
              grow your savings and achieve your financial goals.
            </p>
          </motion.div>

          {/* ==========================
              BANK CARD
          ========================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              rotate: -1,
            }}
            animate={{
              opacity: 1,
              y: 0,
              rotate: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.16,
            }}
            className="relative z-10 mt-7"
          >
            <div
              className="
                relative
                max-w-[470px]
                overflow-hidden
                rounded-[26px]
                border
                border-white/10

                bg-gradient-to-br
                from-[#12364A]
                via-[#0D2A3B]
                to-[#081E2D]

                p-6

                shadow-[0_25px_55px_rgba(0,0,0,0.3)]
              "
            >
              {/* Card glow */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-20
                  -top-20
                  h-56
                  w-56
                  rounded-full
                  bg-emerald-400/20
                  blur-3xl
                "
              />

              {/* Balance */}

              <div
                className="
                  relative
                  z-10
                  flex
                  items-start
                  justify-between
                "
              >
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Available balance
                  </p>

                  <h3
                    className="
                      mt-2
                      text-3xl
                      font-bold
                      tracking-tight
                      text-white
                    "
                  >
                    ₹42,850
                  </h3>
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    text-emerald-300
                  "
                >
                  <FiWifi className="rotate-90 text-xl" />

                  <FiCreditCard className="text-2xl" />
                </div>
              </div>

              {/* Card number */}

              <div className="relative z-10 mt-8">
                <p
                  className="
                    text-sm
                    tracking-[0.25em]
                    text-slate-300
                  "
                >
                  •••• &nbsp; •••• &nbsp; •••• &nbsp; 4821
                </p>
              </div>

              {/* Card bottom */}

              <div
                className="
                  relative
                  z-10
                  mt-5
                  flex
                  items-end
                  justify-between
                "
              >
                <div>
                  <p
                    className="
                      text-[9px]
                      uppercase
                      tracking-wider
                      text-slate-500
                    "
                  >
                    Card holder
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-200
                    "
                  >
                    Budget Buddy
                  </p>
                </div>

                <div className="text-right">
                  <p
                    className="
                      text-[9px]
                      uppercase
                      tracking-wider
                      text-slate-500
                    "
                  >
                    Valid thru
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      font-semibold
                      text-slate-200
                    "
                  >
                    08/29
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ==========================
              STATS
          ========================== */}

          <div
            className="
              relative
              z-10
              mt-4
              grid
              grid-cols-3
              gap-3
            "
          >
            <StatCard
              label="Total savings"
              value="₹24,500"
              badge="+12.4%"
              delay={0.28}
            />

            <StatCard
              label="Spent this month"
              value="₹18,240"
              delay={0.34}
            />

            {/* Budget card */}

            <motion.div
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.45,
                delay: 0.4,
              }}
              className="
                rounded-2xl
                border
                border-white/10
                bg-white/10
                p-4
                backdrop-blur-xl
              "
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Budget
                </p>

                <span
                  className="
                    text-xs
                    font-bold
                    text-emerald-300
                  "
                >
                  72%
                </span>
              </div>

              <p className="mt-1 text-lg font-bold text-white">
                ₹36K
              </p>

              <div
                className="
                  mt-2
                  h-1.5
                  overflow-hidden
                  rounded-full
                  bg-white/10
                "
              >
                <motion.div
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: "72%",
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.5,
                  }}
                  className="
                    h-full
                    rounded-full
                    bg-emerald-400
                  "
                />
              </div>
            </motion.div>
          </div>

          {/* ==========================
              FEATURES
          ========================== */}

          <div
            className="
              relative
              z-10
              mt-6
              grid
              grid-cols-3
              gap-4
              border-t
              border-white/10
              pt-5
            "
          >
            <Feature
              icon={FiShield}
              title="Secure"
              description="Protected data"
            />

            <Feature
              icon={FiBarChart2}
              title="Insights"
              description="Smart analytics"
            />

            <Feature
              icon={FiTarget}
              title="Goals"
              description="Track progress"
            />
          </div>

          {/* Footer */}

          <div
            className="
              relative
              z-10
              mt-auto
              pt-5
              text-[11px]
              text-slate-500
            "
          >
            © 2026 Budget Buddy · Smarter money starts here.
          </div>
        </section>

        {/* ======================================
            RIGHT PANEL
        ====================================== */}

        <section
          className="
            relative
            flex
            items-center
            justify-center

            bg-gradient-to-br
            from-[#EAF4F1]
            via-[#F2F7F5]
            to-[#E4F0EC]

            px-5
            py-16

            sm:px-10

            lg:px-14
            lg:py-10

            xl:px-20
          "
        >
          {/* Decorative glow */}

          <div
            className="
              pointer-events-none
              absolute
              right-[-100px]
              top-[-100px]
              h-[350px]
              w-[350px]
              rounded-full
              bg-emerald-300/20
              blur-[100px]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              bottom-[-120px]
              left-[-80px]
              h-[320px]
              w-[320px]
              rounded-full
              bg-teal-300/10
              blur-[100px]
            "
          />

          {/* Mobile Logo */}

          <div
            className="
              absolute
              left-5
              top-5
              z-10
              flex
              items-center
              gap-2

              lg:hidden
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                bg-[#071A2B]
                text-emerald-400
                shadow-md
              "
            >
              <FiCreditCard />
            </div>

            <span className="font-bold text-[#071A2B]">
              Budget Buddy
            </span>
          </div>

          {/* ==========================
              FORM CARD
          ========================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 14,
              scale: 0.99,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.5,
            }}
            className="
              relative
              z-10
              w-full
              max-w-[540px]

              rounded-[28px]

              border
              border-white/80

              bg-white/80

              p-6

              shadow-[0_25px_70px_rgba(7,26,43,0.10)]

              backdrop-blur-xl

              sm:p-8
              xl:p-10
            "
          >
            {/* Subtle card highlight */}

            <div
              className="
                pointer-events-none
                absolute
                inset-x-10
                top-0
                h-px
                bg-gradient-to-r
                from-transparent
                via-emerald-300/60
                to-transparent
              "
            />

            {children}
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default AuthLayout;