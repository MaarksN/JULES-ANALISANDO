import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PrismaService } from "../database/prisma.service";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        global: true,
        secret:
          process.env.JWT_SECRET ||
          (process.env.NODE_ENV === "production"
            ? undefined
            : "dev_secret_key_123"),
        signOptions: { expiresIn: "1d" },
      }),
    }),
  ],
  providers: [AuthService, PrismaService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
