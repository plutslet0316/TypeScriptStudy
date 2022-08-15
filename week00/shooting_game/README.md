# 슈팅 게임 데모

멘토님이 작성한 횡스크롤 코드에 덧붙여서 만든 슈팅 게임입니다.

비행기를 조종해서 날아오는 적을 물리처 점수를 얻는 횡스크롤 슈팅 게임을 만들어봤습니다.

슈팅 게임은 이 [링크](https://plutslet.pe.kr/shoot/)를 통해서도 확인할 수 있습니다.

<br>

## 구현된 부분

구현된 부분은 크게 세 부분입니다.

1. 키보드와 마우스로 조종해 총을 쏨

    이 부분은 참고 링크에서 키보드 이벤트 및 동시 입력, 마우스 이벤트 등 검색을 통해 자료를 찾고 작성했습니다.

2. 플레이 시간과 적을 물리치면 점수를 얻음

    이 부분은 점수와 시간 변수를 만들어두고, 해당 변수를 `ScoreActor` 클래스가 화면에 보여주는 방식으로 구현했습니다.

3. 적을 물리치다 보면 나타나는 큰 녀석

    심심해서 추가한 부분입니다. 특정 점수가 되면 큰 녀석 한 마리가 소환되고, 작은 녀석들은 큰 녀석이 사라질 때까지 소환되지 않습니다.

일단 이렇게 크게 세 부분이 구현되었고, 모든 환경에서 동일하게 처리하는 부분은 참고링크에 있는  requestAnimationFrame 활용 부분을 읽고 작성했습니다. `update` 함수 내에 주석으로 표시해 두었습니다.

## 구현하고 싶은 부분

1. 적이 총알을 쏘고, 적과 적이 쏜 총알에 캐릭터가 맞음
2. 캐릭터의 체력이 모두 소모되면 캐릭터가 패배함
3. 시작 화면, 일시 정지, 패배 & 승리 등 필요한 화면 처리
4. 욕심 부려서 아이템까지 만든다면 좋겠다

<br>

## 참고 링크

[멘토님이 만드신 횡스크롤 데모](https://www.maum.in/samples/scrolling/index.html)

[requestAnimationFrame 활용](https://velog.io/@younghwanjoe/requestAnimationFrame%EC%9D%84-%EC%82%AC%EC%9A%A9%ED%95%98%EC%97%AC-%EC%95%A0%EB%8B%88%EB%A9%94%EC%9D%B4%EC%85%98-%EA%B5%AC%ED%98%84%ED%95%98%EA%B8%B0-%EC%83%81) - 모든 환경에서 동일하게 처리하기

[키보드 이벤트](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)  - 키보드 이벤트에 대한 전반적인 내용

[키보드 동시 입력](https://donggov.tistory.com/184) - 불린 배열로 키 입력 관리

[마우스 이벤트](https://hianna.tistory.com/492) - 마우스 이벤트 예제

[횡스크롤 에셋](https://opengameart.org/content/free-plane-sprite) - 횡스크롤 비행기 무료 에셋
