"use client"

import React, {
  createContext,
    useContext,
      useEffect,
        useState,
          type ReactNode,
          } from "react"
          import { supabase, type User } from "./supabase"

          interface AuthContextType {
            user: User | null
              loading: boolean
                signIn: (userId: number, name: string) => Promise<void>
                  signOut: () => void
                  }

                  const AuthContext = createContext<AuthContextType | undefined>(undefined)

                  export function AuthProvider({ children }: { children: ReactNode }) {
                    const [user, setUser] = useState<User | null>(null)
                      const [loading, setLoading] = useState(true)

                        useEffect(() => {
                            const storedUser = localStorage.getItem("p2p_user")
                                if (storedUser) {
                                      try {
                                              const parsed = JSON.parse(storedUser)
                                                      setUser(parsed)
                                                            } catch (e) {
                                                                    console.warn("Invalid user data in localStorage.")
                                                                          }
                                                                              }
                                                                                  setLoading(false)
                                                                                    }, [])

                                                                                      const signIn = async (userId: number, name: string) => {
                                                                                          try {
                                                                                                const { data: existingUser, error: selectError } = await supabase
                                                                                                        .from("users")
                                                                                                                .select("*")
                                                                                                                        .eq("id", userId)
                                                                                                                                .single()

                                                                                                                                      if (selectError && selectError.code !== "PGRST116") throw selectError

                                                                                                                                            let userData: User

                                                                                                                                                  if (existingUser) {
                                                                                                                                                          userData = existingUser
                                                                                                                                                                } else {
                                                                                                                                                                        const { data: newUser, error: insertError } = await supabase
                                                                                                                                                                                  .from("users")
                                                                                                                                                                                            .insert([{ id: userId, name, role: "user" }])
                                                                                                                                                                                                      .select()
                                                                                                                                                                                                                .single()

                                                                                                                                                                                                                        if (insertError) throw insertError
                                                                                                                                                                                                                                userData = newUser
                                                                                                                                                                                                                                      }

                                                                                                                                                                                                                                            setUser(userData)
                                                                                                                                                                                                                                                  localStorage.setItem("p2p_user", JSON.stringify(userData))
                                                                                                                                                                                                                                                      } catch (error) {
                                                                                                                                                                                                                                                            console.error("Sign in error:", error)
                                                                                                                                                                                                                                                                  throw error
                                                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                                                        }

                                                                                                                                                                                                                                                                          const signOut = () => {
                                                                                                                                                                                                                                                                              setUser(null)
                                                                                                                                                                                                                                                                                  localStorage.removeItem("p2p_user")
                                                                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                                                                      return React.createElement(
                                                                                                                                                                                                                                                                                          AuthContext.Provider,
                                                                                                                                                                                                                                                                                              { value: { user, loading, signIn, signOut } },
                                                                                                                                                                                                                                                                                                  children
                                                                                                                                                                                                                                                                                                    )
                                                                                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                                                                                    export function useAuth(): AuthContextType {
                                                                                                                                                                                                                                                                                                      const context = useContext(AuthContext)
                                                                                                                                                                                                                                                                                                        if (!context) {
                                                                                                                                                                                                                                                                                                            throw new Error("useAuth must be used within an AuthProvider")
                                                                                                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                                                                                                return context
                                                                                                                                                                                                                                                                                                                }

                                                                                                                                                                                                                                                                                                                export async function makeUserOwner(userId: number): Promise<boolean> {
                                                                                                                                                                                                                                                                                                                  try {
                                                                                                                                                                                                                                                                                                                      const { data: owners, error: ownerCheckError } = await supabase
                                                                                                                                                                                                                                                                                                                            .from("users")
                                                                                                                                                                                                                                                                                                                                  .select("id")
                                                                                                                                                                                                                                                                                                                                        .eq("role", "owner")

                                                                                                                                                                                                                                                                                                                                            if (ownerCheckError) throw ownerCheckError
                                                                                                                                                                                                                                                                                                                                                if (owners && owners.length > 0) {
                                                                                                                                                                                                                                                                                                                                                      throw new Error("Platform already has an owner")
                                                                                                                                                                                                                                                                                                                                                          }

                                                                                                                                                                                                                                                                                                                                                              const { error: updateError } = await supabase
                                                                                                                                                                                                                                                                                                                                                                    .from("users")
                                                                                                                                                                                                                                                                                                                                                                          .update({ role: "owner" })
                                                                                                                                                                                                                                                                                                                                                                                .eq("id", userId)

                                                                                                                                                                                                                                                                                                                                                                                    if (updateError) throw updateError

                                                                                                                                                                                                                                                                                                                                                                                        return true
                                                                                                                                                                                                                                                                                                                                                                                          } catch (error) {
                                                                                                                                                                                                                                                                                                                                                                                              console.error("Make owner error:", error)
                                                                                                                                                                                                                                                                                                                                                                                                  throw error
                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                    }
