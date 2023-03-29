import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { LibraryBook } from '../../Store/Types'
import { useInView } from "react-intersection-observer";
import useSelectorTyped from "../../Store";
// import Components

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import { EffectCoverflow } from "swiper";
import BookCover from "../../Components/Contents/BookCover";
import { getLibraryBooksAPI, getRegionCodeAPI } from "../../apis/region";
import DetailModal from "../../Components/Contents/DetailModal";


// Component
export default function LibraryBooks() {
  const nickname = useSelectorTyped((state) => state.user.name);
  const [ref, inView] = useInView();
  const [books, setBooks] = useState<LibraryBook[]>();
  const [position, setPosition] = useState<[number, number]>([-1, -1]);
  const [regionName, setRegionName] = useState<any>('');
  const [regionCode, setRegionCode] = useState<any>(-1);
  const [isbn, setIsbn] = useState<number>(0);

  useEffect(() => {
    // 현재 좌표 구하기
    navigator.geolocation.getCurrentPosition((position) => {
      setPosition([position.coords.longitude, position.coords.latitude])
    })
  }, [])

  // 좌표로 지역코드 받아오기
  useEffect(() => {
    if (position[0] !== -1) {
      getRegionCode()
    }
  }, [position])

  // 지역코드로 도서관 인기도서 받기
  useEffect(() => {
    if (regionCode !== -1) {
      // getLibraryBooks(regionCode)
    }
  }, [regionCode])

  const getRegionCode = async () => {
    const data = await getRegionCodeAPI(position[0], position[1])
    setRegionName(data?.regionName)
    setRegionCode(data?.regionCode)
  }

  const getLibraryBooks = async (REGION_CODE: number) => {
    const data = await getLibraryBooksAPI(REGION_CODE)

    let tmp: LibraryBook[] = []
    data.forEach((book: any) => {
      tmp.push({
        imageUrl: book.bookImageURL,
        ISBN: book.isbn13,
        ranking: book.ranking,
        title: book.bookname,
      })
    })
    setBooks(tmp)
  }

  // modal관련 함수
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  const openModal = (ISBN: number): void => {
    setModalOpen(!modalOpen)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const closeModal = (): void => {
    setModalOpen(false);
  }

  return (
    <>
      <Container>
        <Title ref={ref} className={inView ? 'title' : ''}>
          {nickname}님이 계신 지역의
          <br />
          인기 대출 도서
        </Title>
        <Desc>{regionName} 지역의 인기 도서를 만나보세요!</Desc>
        <SwiperWrap>
          <Swiper
            effect={"coverflow"}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={2}
            coverflowEffect={{
              rotate: 50,
              stretch: 0,
              depth: 100,
              modifier: 1,
            }}
            modules={[EffectCoverflow]}
          >
            <>{
              books?.map((book, idx) => {
                return (
                  <SwiperSlide onClick={() => openModal(book.ISBN)} key={book.ISBN} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <BookCover imageUrl={book.imageUrl} size={170} />
                    <BookTitle>
                      {book.title}
                    </BookTitle>
                    <Ranking>
                      {idx + 1}위
                    </Ranking>
                  </SwiperSlide>
                )
              })
            }
            </>
          </Swiper>
        </SwiperWrap>
      </Container>
      {modalOpen &&
        <DetailModal ISBN={isbn} closeModal={closeModal} modalOpen={modalOpen} />
      }
    </>
  );
};


// Styled Components
const Container = styled.div`
  width : 100%;
  height: 600px;
  background-color: #F9F9F7;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const Title = styled.div`
  font-size: 25px;
  font-weight: 700;
  text-align: center;
  margin: 3% 0; 
  text-shadow: 0px 3px 3px #00000040;
  &.title {
    animation: fadeIn 2s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity:3;
      transform: none;
    }   
  }
`;

const Desc = styled.div`
  margin-top: 7%;
  font-size: 13px;
  font-weight: 500;
  color: #5c5c5c;
  text-align: center;
`;

const SwiperWrap = styled.div`
  margin-top: 12%;
`

const BookTitle = styled.div`
  font-size: 15px;
  margin-top: 5%;
  white-space: pre-line;
`
const Ranking = styled.div`
  border: 2px solid #edc200;
  color: #edc200;
  border-radius: 20px;
  display: flex;
  width: 50px;
  margin: auto;
  margin-top: 3%;
  justify-content: center;
`