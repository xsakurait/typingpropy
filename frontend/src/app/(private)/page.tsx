import { getLessons } from '../../apis/lessons.server';
import HomeClient from './components/HomeClient';

export default async function Home() {
  const initialLessons = await getLessons();

  return (
    <HomeClient initialLessons={initialLessons} />
  );
}
