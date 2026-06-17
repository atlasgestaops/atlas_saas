-- Adicionar coluna de e-mail ao perfil
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Atualizar a função do gatilho para persistir o e-mail
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, email)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    COALESCE(new.raw_user_meta_data->>'role', 'comercial'),
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
