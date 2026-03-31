import pick from "lodash/pick";
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import connectPlatformDB from "#utils/database/connect";
import { Clients } from "#utils/database/models/platform/client";
import { PlatformAdmins } from "#utils/database/models/platform/platformAdmin";
import { getTenantModels } from "#utils/database/models/tenant";
import type { TAccount } from "#utils/database/schemas/accountSchema";
import { getTenantConnection } from "#utils/database/tenantConnect";

import { isEmailValid } from "./common";
import { verifyPassword } from "./passwordHelper";

export const authOptions: AuthOptions = {
	secret: process.env.NEXTAUTH_SECRET,
	providers: [
		CredentialsProvider({
			id: "platform",
			name: "platform",
			credentials: {
				email: { label: "Email", type: "email", placeholder: "Enter your email" },
				password: { label: "Password", type: "password", placeholder: "Enter your password" },
			},
			async authorize(cred) {
				if (!cred?.email) throw new Error("Email is required");
				if (!cred?.password) throw new Error("Password is required");

				await connectPlatformDB();
				const admin = await PlatformAdmins.findOne({ email: cred.email.toLowerCase() });
				if (!admin) throw new Error("Account not found.");
				if (!admin.active) throw new Error("Account is disabled.");
				if (!(await verifyPassword(cred.password, admin.password))) throw new Error("Invalid credentials");

				return {
					id: admin._id.toString(),
					role: "platform_admin" as const,
					themeColor: undefined,
					_doc: {
						role: "platform_admin" as const,
						email: admin.email,
						username: admin.name,
						// biome-ignore lint/suspicious/noExplicitAny: Complex type matching
					} as any,
				};
			},
		}),
		CredentialsProvider({
			id: "restaurant",
			name: "restaurant",
			credentials: {
				username: { label: "Username", type: "text", placeholder: "Enter your username or email" },
				kitchen: { label: "Kitchen Username", type: "text", placeholder: "Enter your kitchen username" },
				password: { label: "Password", type: "password", placeholder: "Enter your password" },
			},
			async authorize(cred) {
				console.log("🔐 Restaurant login attempt:", cred?.username);
				if (!cred?.username) throw new Error("Restaurant username is required");
				if (!cred?.password) throw new Error("Password is required");

				await connectPlatformDB();

				// Resolve client from platform DB
				const credential = isEmailValid(cred?.username) ? { email: cred?.username } : { username: cred?.username };

				// First try to find the client by slug to get the tenant DB
				// We need to find the account first, so try platform lookup by email or direct tenant query
				let clientId: string | undefined;
				let account: TAccount | null = null;

				// Look up all active clients and search their tenant DBs
				// For efficiency, if it's a username (slug), try direct client lookup
				if (!isEmailValid(cred.username)) {
					const client = await Clients.findOne({ slug: cred.username.toLowerCase() });
					if (client && (client.status === "active" || client.status === "trial")) {
						const conn = await getTenantConnection(client.databaseName);
						const models = getTenantModels(conn);
						account = await models.Accounts.findOne<TAccount>(credential)
							.populate("profile")
							.populate({ path: "kitchens", match: { username: cred?.kitchen } });
						clientId = client.clientId;
					}
				}

				// If login is by email, search across clients (less common for restaurant login)
				if (!account && isEmailValid(cred.username)) {
					const clients = await Clients.find({ status: { $in: ["active", "trial"] } });
					for (const client of clients) {
						const conn = await getTenantConnection(client.databaseName);
						const models = getTenantModels(conn);
						const found = await models.Accounts.findOne<TAccount>(credential)
							.populate("profile")
							.populate({ path: "kitchens", match: { username: cred?.kitchen } });
						if (found) {
							account = found;
							clientId = client.clientId;
							break;
						}
					}
				}

				if (!account) throw new Error("Account not found.");

				if (cred?.kitchen) {
					if (!(await verifyPassword(cred?.password, account?.kitchens?.[0]?.password))) throw new Error("Invalid kitchen credentials");

					return {
						id: account._id.toString(),
						role: "kitchen" as const,
						clientId,
						themeColor: account?.profile?.themeColor,
						_doc: { ...account.toObject(), clientId } as unknown as TAccount,
					};
				}

				if (!(await verifyPassword(cred?.password, account?.password))) throw new Error("Invalid admin credentials");

				return {
					id: account._id.toString(),
					role: "admin" as const,
					clientId,
					themeColor: account?.profile?.themeColor,
					_doc: { ...account.toObject(), clientId } as unknown as TAccount,
				};
			},
		}),
		CredentialsProvider({
			id: "customer",
			name: "customer",
			credentials: {
				restaurant: { label: "Restaurant Username", type: "text", placeholder: "Enter restaurant username" },
				table: { label: "Table ID", type: "string", placeholder: "Enter the table id" },
				phone: { label: "Phone Number", type: "number", placeholder: "Enter your phone number" },
				fname: { label: "Name", type: "text", placeholder: "Enter your first name" },
				lname: { label: "Name", type: "text", placeholder: "Enter your last name" },
			},
			async authorize(cred) {
				if (!cred?.restaurant) throw new Error("Restaurant id is required");
				if (!cred?.table) throw new Error("Table id is required");
				if (!cred?.fname) throw new Error("First name is required");
				if (!cred?.lname) throw new Error("Last name is required");
				if (!cred?.phone) throw new Error("Phone number is required");

				await connectPlatformDB();

				// Resolve client from slug
				const client = await Clients.findOne({ slug: cred.restaurant.toLowerCase() });
				if (!client || (client.status !== "active" && client.status !== "trial")) throw new Error("Restaurant not found.");

				const conn = await getTenantConnection(client.databaseName);
				const models = getTenantModels(conn);

				const customerCred = {
					fname: cred?.fname,
					lname: cred?.lname,
					phone: cred?.phone,
				};

				let customer = await models.Customers.findOne({ phone: cred?.phone });
				if (!customer) customer = await new models.Customers(customerCred).save();

				const account = await models.Accounts.findOne<TAccount>({ username: cred?.restaurant }).populate("profile").populate("tables");

				if (!account) throw new Error("Restaurant not found.");
				if (!account?.tables?.some?.(({ username }: { username: string }) => username === cred?.table)) throw new Error("Invalid table id");

				return {
					id: customer._id.toString(),
					role: "customer" as const,
					clientId: client.clientId,
					themeColor: account?.profile?.themeColor,
					_doc: {
						role: "customer",
						clientId: client.clientId,
						customer: customer,
						restaurant: {
							username: account?.profile?.restaurantID,
							table: cred?.table,
							name: account?.profile?.name,
							avatar: account?.profile?.avatar,
						},
						// biome-ignore lint/suspicious/noExplicitAny: Complex type matching
					} as any,
				};
			},
		}),
	],
	session: { strategy: "jwt" },
	callbacks: {
		async session({ session, token }) {
			session = {
				...session,
				...token?.user,
			};
			delete session.user;
			return session;
		},
		async jwt({ token, user, account }) {
			if (account?.provider === "platform") {
				if (user) {
					token.user = {
						role: user?.role,
						...pick(user._doc, ["email", "username"]),
					};
				}
			}

			if (account?.provider === "restaurant") {
				if (user) {
					const clientId = user?.clientId ?? user?._doc?.clientId;
					token.user = {
						role: user?.role,
						clientId,
						themeColor: user?.themeColor,
						...pick(user._doc, ["email", "accountActive", "subscriptionActive", "username", "verified"]),
					};
				}
			}

			if (account?.provider === "customer") {
				if (user) {
					token.user = {
						...user._doc,
						clientId: user?.clientId,
					};
				}
			}
			return token;
		},
	},
};
