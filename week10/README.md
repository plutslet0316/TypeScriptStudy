# 모듈

10주차에는 Handbook의 Modules 내용을 학습했습니다.

<br>

## 자바스크립트 모듈을 정의하는 법

타입스크립트에서는 ECMAScript 2015와 마찬가지로 최상위 수준의 `import` 나 `export` 가 포함된 파일은 모듈로 간주된다.

반대로 `import` 나 `exprot` 가 없는 파일은 전역 범위에서 콘텐츠를 사용할 수 있는 스크립트로 취급된다.

모듈은 글로벌 범위가 아닌 자체 범위 내에서 실행된다. 모듈에 선언된 변수, 함수, 클래스 등은 내보내기 양식 중 하나를 사용하여 명시적으로 내보내지 않는 한 모듈 외부에서 볼 수 없다. 반대로 다른 모듈에서 내보낸 변수, 함수, 클래스, 인터페이스 등을 사용하려면 가져오기 양식 중 하나를 사용하여 가져와야 한다.

<br>

## 비모듈

자바스크립트 사양은  `exprot` 나 최상위의 `await` 기능이 없는 자바스크립트 사양은 모듈이 아닌 스크립트로 간주된다.

스크립트 파일 변수와 타입은 공유 전역 범위에 있다고 선언되면, 컴파일러 옵션인 outFile 을 사용하여 출력 파일에 결합하거나 HTML에서 여러 `<scirpt>` 태그를 사용하여 이런 파일을 올바른 순서로 로드한다고 가정한다.

`import` 나 `export` 가 없지만 모듈로 처리하려는 파일이 있는 경우는 다음을 추가한다.

```tsx
export {};
```

그러면 파일이 아무것도 내보내지 않는 모듈로 변경된다. 이 구문은 모듈 대상에 관계 없이 작동한다.

<br>

## 타입스크립트에서 모듈

타입스크립트에서 모듈 기반 코드를 작성할 때 고려해야하는 세 가지 주요 사항은 다음과 같다.

- **구문**: 항목을 가져오거나 내보낼 때 사용하는 구문은 무엇인가?
- **모듈 해석**: 모듈 이름과 파일 사이에 어떤 관계가 있는가?
- **모듈 츌력 대상**: 내보낸 자바스크립트 모듈은 어떻게 보여지는가?

### ES 모듈 구문

파일은 `export default` 을 통해 메인이 되는 `export` 를 선언할 수 있다.

```tsx
// @filename: hello.ts
export default function helloWorld() {
  console.log("Hello, world!");
}
```

다음처럼 가져올 수 있다.

```tsx
import helloWorld from "./hello.js";
helloWorld();
```

`default` 를 생략해서 변수 및 함수를 둘 이상 `export` 할 수 있다.

```tsx
// @filename: maths.ts
export var pi = 3.14;
export let squareTwo = 1.41;
export const phi = 1.61;

export class RandomNumberGenerator {}

export function absolute(num: number) {
  if (num < 0) return num * -1;
  return num;
}
```

다른 파일에서 `import` 구문을 통해 가져올 수 있다.

```tsx
import { pi, phi, absolute } from "./maths.js";

console.log(pi);
const absPhi = absolute(phi);
```

### 추가적인 `import` 구문

가져올 때 `import {old as new}` 를 사용하면 이름을 바꿀 수 있다.

```tsx
import { pi as π } from "./maths.js";

console.log(π);
```

위의 구문을 하나의 `import` 구문으로 섞거나 일치시킬 수 있다.

```tsx
// @filename: maths.ts
export const pi = 3.14;
export default class RandomNumberGenerator {}
 
// @filename: app.ts
import RandomNumberGenerator, { pi as π } from "./maths.js";
 
RandomNumberGenerator;
 
console.log(π);
```

내보낸 모든 개체를 가져와서 `* as name` 를 사용하여 단일 네이스페이스에 넣을 수 있다.

```tsx
// @filename: app.ts
import * as math from "./maths.js";
 
console.log(math.pi);
const positivePhi = math.absolute(math.phi);
```

현재 모듈에 `import “./file”` 를 사용해 어떤 변수도 포함하지 않고 파일을 가져올 수 있다.

```tsx
import "./maths.js";

console.log("3.14");
```

이 경우 `import` 는 아무 작업도 수행하지 않는다. 그러나 `maths.ts` 의 모든 코드가 평가되어 다른 개체에 영향을 미치는 부작용을 낼 수 있다.

**타입스크립트의 특정 ES 모듈 구문**

타입은 자바스크립트 값과 동일한 구문을 사용하여 내보내고 가져올 수 있다.

```tsx
// @filename: animal.ts
export type Cat = { breed: string; yearOfBirth: number };
 
export interface Dog {
  breeds: string[];
  yearOfBirth: number;
}
 
// @filename: app.ts
import { Cat, Dog } from "./animal.js";
type Animals = Cat | Dog;
```

타입스크립트는 타입 가져오기를 선언하기 위한 두 가지 개념으로 `import` 구문을 확장했다.

**import type**: 타입만 가져올 수 있는 `import` 구문이다.

```tsx
// @filename: animal.ts
export type Cat = { breed: string; yearOfBirth: number };
export type Dog = { breeds: string[]; yearOfBirth: number };
export const createCatName = () => "fluffy";
 
// @filename: valid.ts
import type { Cat, Dog } from "./animal.js";
export type Animals = Cat | Dog;
 
// @filename: app.ts
import type { createCatName } from "./animal.js";
const name = createCatName();  // 값이 아닌 타입으로 처리되서 오류
'createCatName' cannot be used as a value because it was imported using 'import type'.
```

**Inline `type` imports**: 타입스크립트 4.5는 가져온 참조가 타입임을 나타내기 위해 개별 가져오기에 접두사를 붙일 수 있다.

```tsx
// @filename: app.ts
import { createCatName, type Cat, type Dog } from "./animal.js";
 
export type Animals = Cat | Dog;
const name = createCatName();
```

이를 통해 Babel, swc 또는 esbuild 와 같은 타입스크립트가 아닌 트랜스파일(transpiler)이 안전하게 제거할 수 있는 `import` 인지 알 수 있다.

**CommonJS 동작을 사용하는 ES 모듈 구문**

타입스크립트에는 CommonJS 및 AMD `require` 과 직접 상하관계가 있는 ES 모둘 구문이 있다. ES 모듈을 사용한 `import` 는 대부분의 경우 해당 환경의 요구사항과 동일하지만, 이 구문은 타입스크립트 파일에서 CommonJS와 1 대 1로 일치하도록 보장한다.

```tsx
import fs = require("fs");
const code = fs.readFileSync("hello.ts", "utf8");
```

<br>

## **CommonJS 구문**

CommonJS는 대부분의 npm 모듈이 전달되는 형식이다. 위의 ES 모듈 구문을 사용하여 작성하는 경우에도 공통점을 간략히 이해하면 더 쉽게 디버깅할 수 있게 된다.

**내보내기**

식별자는 전역 호출된 `module` 에서 `exports` 속성을 설정하여 내보낸다.

```tsx
function absolute(num: number) {
  if (num < 0) return num * -1;
  return num;
}
 
module.exports = {
  pi: 3.14,
  squareTwo: 1.41,
  phi: 1.61,
  absolute,
};
```

그런 다음 `require` 문을 통해 다음 파일을 가져올 수 있다.

```
const maths = require("maths");
maths.pi;
```

또는 자바스크립트의 파괴 기능을 사용하여 조금 단순화할 수 있다.

```tsx
const { squareTwo } = require("maths");
squareTwo;
```

### CommonJS와 ES 모듈 상호 운용

기본 가져오기와 모듈 네임스페이스 객체 가져오기 간의 구별과 관련하여 CommonJS와 ES 모듈의 기능이 일치하지 않는다. 타입스크립트에는 두 개의 서로 다른 제약 조건 세트 사이의 마찰을 줄이기 위한 컴파일러 플래그, esModuleInterop가 있다.

<br>

## 타입스크립트의 모듈 해석 옵션

모듈 해석은 `import` 또는 `require` 문에서 문자열을 가져와 해당 문자열이 참조하는 파일을 결정하는 프로세스다.

타입스크립트에는 두 가지 해석 전략, Classic과 Node가 포함되어 있다. 컴파일러 옵션 module이 CommonJS가 아닐 때의 기본 값인 Classic은 이전 버젼과의 호환성을 위해 포함되어 있다. Node 전략은 Node.js가 `.ts` 와 `.d.ts` 의 추가 검사와 함께 CommonJS 모드로 작동하는 방식을 복제한다.

타입스크립트에는 moduleResolution, baseUrl, paths, rootDirs와 같은 모듈 전략에 영향을 미치는 많은 TSConfig 구성 플래그가 있다.

<br>

## 타입스크립트의 모듈 출력 옵션

내보낸 자바스크립트 출력에 영향을 주는 두 가지 옵션이 잇다.

- **target**: 어떤 자바스크립트의 기능이 하향조정되거나 그대로 유지되는 결정한다.
- **module**: 모듈이 상호 작용하는데 사용되는 코드를 결정한다.

대상은 타입스크립트를 실행할 것으로 예상되는 자바스크립트 런타입에 따라 결정된다. 그건 가장 오래된 웹 브라우저이거나 실행될 것으로 예상되는 Node.js의 가장 낮은 버전일 수도 있고, Electrion과 같은 런타임의 고유한 제약에서 비롯될 수도 있다.

모듈 간의 통신은 모듈 로덜르 통해 이루어지며, 컴파일러 옵션 모듈은 어떤 것이 사용되는지 결정합니다. 런타임에 모듈 로더는 모듈을 실행하기 전에 모듈의 모든 종속성을 찾고 실행하는 책임이 있다.

예를 들어, 다음은 ES 모듈 구문을 사용하는 타입스크립트 파일로, 모듈에 대한 몇 가지 옵션을 보여준다.

```tsx
import { valueOfPi } from "./constants.js";
 
export const twoPi = valueOfPi * 2;
```

**ES2020**

```jsx
import { valueOfPi } from "./constants.js";
export const twoPi = valueOfPi * 2;
```

**CommonJS**

```jsx
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.twoPi = void 0;
// @showEmit
// @module: commonjs
// @noErrors
const constants_js_1 = require("./constants.js");
exports.twoPi = constants_js_1.valueOfPi * 2;
```

**UMD**

```jsx
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./constants.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.twoPi = void 0;
    // @showEmit
    // @module: umd
    // @noErrors
    const constants_js_1 = require("./constants.js");
    exports.twoPi = constants_js_1.valueOfPi * 2;
});
```

여기서 ES2020은 원본 파일과 사실상 동일하다.

<br>

## 타입스크립트 네임스페이스

타입스크립트는 ES 모듈 표준보다 앞선 네임스페이스라고 불리는 자체 모듈 타입을 가지고 있다. 이 구문은 복잡한 정의 파일을 만드는 데 많은 유용한 기능을 가지고 있으며, 여전히 DefinitelyTyped에서 사용 중이다. 네임스페이스 대부분의 기능은 ES 모듈에 존재하며 자바스크립트의 방향에 맞게 조정하는 것이 좋다.
