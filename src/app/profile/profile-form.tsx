'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '@/firebase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

import { profileUserSchema } from './profile-form-schema'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetUser } from '@/http/user/get-user'
import { useUser } from '@/hooks/use-user'
import { useUpdateUser } from '@/http/user/put-user'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function ProfileForm() {
  const { user } = useUser()
  const { push } = useRouter()
  const { data: userData, isLoading } = useGetUser()
  const { mutateAsync: updateUser, isPending } = useUpdateUser()
  const [isUploading, setIsUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof profileUserSchema>>({
    resolver: zodResolver(profileUserSchema),
    defaultValues: {
      avatar: '',
      name: '',
      cpf: '',
      birthDate: '',
      role: 'user',
      sex: 'M',
      phone: '',
      email: '',
      address: {
        street: '',
        number: 0,
        neighborhood: '',
        complement: '',
        city: '',
        uf: '',
        zipCode: '',
      },
    },
  })

  useEffect(() => {
    if (userData || user) {
      let formattedDate = ''
      if (userData?.birthDate) {
        formattedDate = new Date(userData.birthDate).toISOString().split('T')[0]
      }

      console.log("🚀 ~ ProfileForm ~ userData:", userData)
      if (!userData) return

      form.reset({
        name: userData?.name || user?.displayName || '',
        email: userData?.email || user?.email || '',
        avatar: userData?.avatar || user?.photoURL || '',
        cpf: userData?.cpf || '',
        sex: userData?.sex || 'M',
        role: userData?.role || 'user',
        phone: userData?.phone ? String(userData.phone) : '',
        birthDate: formattedDate,
        address: {
          street: userData?.address?.street || '',
          number: userData?.address?.number || 0,
          neighborhood: userData?.address?.neighborhood || '',
          complement: userData?.address?.complement || '',
          city: userData?.address?.city || '',
          uf: userData?.address?.uf || '',
          zipCode: userData?.address?.zipCode || '',
        }
      })
    }
  }, [userData, user, form])

  async function onSubmit(values: z.infer<typeof profileUserSchema>) {
    try {
      const { email, ...restOfValues } = values;
      
      const dataToSend = {
        ...restOfValues,
        phone: Number(values.phone.replace(/\D/g, '')),
      }

      await updateUser(dataToSend)

      toast.success('Perfil atualizado com sucesso!')
      push('/')
    } catch (err) {
      console.error('Erro ao atualizar:', err)
      toast.error('Erro ao atualizar perfil. Tente novamente.')
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const storageRef = ref(storage, `avatars/${user?.uid || Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      
      form.setValue('avatar', url, { shouldDirty: true, shouldValidate: true })
      toast.success('Imagem carregada com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao fazer upload da imagem.')
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Dados pessoais</h2>

          <div className="flex items-center gap-6 py-4">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={avatarInputRef}
              onChange={handleAvatarChange}
            />
            <Avatar className="h-24 w-24 border">
              <AvatarImage src={form.watch('avatar')} className="object-cover" />
              <AvatarFallback className="bg-muted">
                {isUploading ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : <Camera className="h-8 w-8 text-muted-foreground" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                disabled={isUploading}
                onClick={() => avatarInputRef.current?.click()}
              >
                {isUploading ? 'Enviando...' : 'Alterar foto de perfil'}
              </Button>
              <p className="text-xs text-muted-foreground">Recomendado: JPG, PNG. Tamanho máximo 2MB.</p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <Input placeholder="Seu nome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input placeholder="000.000.000-00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de nascimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sexo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(00) 00000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de conta</FormLabel>

                <Select
                  key={field.value}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de conta" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    <SelectItem value="admin">Academia</SelectItem>
                    <SelectItem value="user">Competidor</SelectItem>
                  </SelectContent>
                </Select>
 
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Card className={field.value === 'admin' ? 'border-primary bg-primary/5' : 'opacity-60'}>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm">Academia</CardTitle>
                      <CardDescription className="text-xs">Permissões avançadas</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card className={field.value === 'user' ? 'border-primary bg-primary/5' : 'opacity-60'}>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm">Competidor</CardTitle>
                      <CardDescription className="text-xs">Permissões básicas</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Endereço</h2>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <FormField
              control={form.control}
              name="address.zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="00000-000" 
                      {...field} 
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 8)
                        field.onChange(value)
                        
                        if (value.length === 8) {
                          fetch(`https://viacep.com.br/ws/${value}/json/`)
                            .then(res => res.json())
                            .then(data => {
                              if (!data.erro) {
                                form.setValue('address.street', data.logradouro)
                                form.setValue('address.neighborhood', data.bairro)
                                form.setValue('address.city', data.localidade)
                                form.setValue('address.uf', data.uf)
                                toast.success('Endereço preenchido automaticamente!')
                              }
                            })
                            .catch(() => toast.error('Erro ao buscar o CEP.'))
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem className="md:col-span-3">
                  <FormLabel>Rua</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
 
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="address.neighborhood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.complement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complemento (Opcional)</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
 
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Cidade</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.uf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UF</FormLabel>
                  <FormControl><Input maxLength={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending} className="text-white">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Atualizar perfil
          </Button>
        </div>
      </form>
    </Form>
  )
}