# 타입스크립트 리뷰

## 타입스크립트란?

- 마이크로소프트 에서 개발 유지/관리 되는 자바스크립트의 슈퍼셋(Superset: 상위집합)
- 자바스크립트 + 타입(자료형) = 타입스크립트
- 자바 스크립트의 특성을 침범하지 않고 지원해준다. (C와 C++, 자바와 코틀린 같은 느낌)

## 특징

1. 타입(자료형)을 사용한다.
    - 자바스크립트는 숫자와 문자를 비교할 때 타입을 구분하지 않는다.
    - 타입스크립트는 둘을 비교할 때 타입까지 비교한다.
2. 미리 타입을 지정해야하나 모든 타입(any)이 올 수 있도록 지정하거나 컴파일러 옵션으로 타입을 강제하지 않게 설정할 수 있다.
3. 정적타입검사로 오류 체크를 잘 한다.
    - 자바스크립트는 타입이 없어 동적으로 타입을 검사해야한다. 하지만 이 때문에 변수명이 맞다면 오류가 있어도 감지를 못한다. 이러한 이유로 코드가 실행되지 않아도 오류가 어디서 발생했는지 찾아내기 힘들다.(동적타입검사)
    - 타입스크립트는 타입을 미리 지정해 두었기 때문에 정적으로 타입을 검사한다. 때문에 지정해둔 타입과 다르다면 해당 오류를 감지해서 알려준다. 즉, 쉽게 오류를 해결할 수 있다.(정적타입검사)
4. 인터베이스, 제네릭 등을 사용할 수 있다.
    - 자바스크립트에서 지원하지 않는 타입
5. 타입스크립트로 작성된 코드를 자바스크립트 코드로 쉽게 변환이 가능하다.
6. 자바스크립트보다 소스코드 크기가 크다.

## 전망

1. 유명한 JS(자바스크립트) 라이브러리가 사용 언어를 TS(타입스크립트)로 변경
    - Angular, Vue, Jest, Bedux, …
2. TS의 언어적 특성을 JS가 점진적으로 반영하는 중임
3. TS의 개발자가 계속 증가하는 추세
4. TS 개발자로 취업 시 JS보다 우대
5. TS 관련 커뮤니티가 다른 슈퍼셋 커뮤니티 보다 큼
