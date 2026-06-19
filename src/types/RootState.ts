import { LoginSliceState } from 'app/pages/HomePage/slice/types';
import { GlobalSliceState } from 'app//slice/types';
import { ChatSliceState } from 'app/pages/ChatPage/slice/types';
// [IMPORT NEW CONTAINERSTATE ABOVE] < Needed for generating containers seamlessly

/* 
  Because the redux-injectors injects your reducers asynchronously somewhere in your code
  You have to declare them here manually
*/
export interface RootState {
  loginSlice?: LoginSliceState;
  globalSlice?: GlobalSliceState;
  chatSlice?: ChatSliceState;
  // [INSERT NEW REDUCER KEY ABOVE] < Needed for generating containers seamlessly
}