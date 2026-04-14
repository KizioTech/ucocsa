-- Fix infinite recursion in conversation_participants policy
DROP POLICY IF EXISTS "Users can view participants of own conversations" ON public.conversation_participants;

CREATE POLICY "Users can view participants of own conversations" ON public.conversation_participants
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() 
    OR 
    conversation_id IN (
      SELECT cp.conversation_id 
      FROM public.conversation_participants cp 
      WHERE cp.user_id = auth.uid()
    )
  );

-- Also fix conversations policy recursion
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;

CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR
    id IN (
      SELECT cp.conversation_id 
      FROM public.conversation_participants cp 
      WHERE cp.user_id = auth.uid()
    )
  );
