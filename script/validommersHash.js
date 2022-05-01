
// public static Hash ommersHash(final List<BlockHeader> ommers) {
//     return Hash.wrap(keccak256(RLP.encode(out -> out.writeList(ommers, BlockHeader::writeTo))));
// }


// keccak-256 ( rlp ( [OmmerHeader1, ..., OmmerHeaderm] ))

// From the glossary
// Uncle: a child of a parent of a parent of a block that is not the parent, or more generally a child of an ancestor that is not an ancestor. If A is an uncle of B, B is a nephew of A.
//
// Why they are needed?
// To help reward miners for when duplicate block solutions are found because of the shorter block times of Ethereum (compared to other cryptocurrency). An uncle is a smaller reward than a full block. (And if they are submitted later than the next block, the reward rapidly diminishes, ending at zero after seven blocks later.)


// http://wiki.hash.kr/index.php/%EC%88%98%EC%A0%95_%EA%B3%A0%EC%8A%A4%ED%8A%B8_%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C
// 고아블록도 기본 보상의 87.5%, 그 엉클블록을 포함하고 있는 사촌이 나머지 12.5%, 하지만 수수료는 엉클블록에게는 주어지지 않는다.

// 1. 하나의 블록은 반드시 하나의 모블록을 지정해야 하며, 0 또는 그 이상의 삼촌을 지정해야 한다.
// 2. 블록 B에 포함된 삼촌은 다음과 같은 속성들을 가지고 있어야 한다.[4]
//    a. B의 k번째 조상의 직접적인 자손이어야 한다. 여기서 ‘2≤k≤7’.
//    b. B의 조상이어서는 안 된다.
//    c. 유효한 블록 헤더여야 하지만, 이전에 확인되었을 필요도, 또는 심지어 유효한 블록일 필요도 없다.
//    d. 이전 블록들에 포함된 모든 삼촌들, 그리고 같은 블록에 포함된 다른 삼촌들과는 달라야 한다.(중복포함방지)
// 3. 블록 B에 있는 각 삼촌 U에 대해, B의 채굴자는 코인베이스 보상에 더해 추가로 3.125%를 받고, U의 채굴자는 기본 코인베이스 보상의 93.75%를 받는다.

// 단지 최대 7세대만 삼촌을 포함할 수 있는 수정 고스트 프로토콜을 사용하는 이유는 두 가지이다.
// 첫째, 무제한 고스트는 하나의 블록에 대해 어떤 삼촌이 유효한지에 대한 계산을 매우 복잡하게 만든다.
// 둘째, 만일 이더리움과 같은 방식의 보상을 하면서도 무제한 고스트를 적용하게 되면 채굴자들이 공격자의 체인이 아니라 주체인에서 채굴을 할 동기를 잃게 될 것이다.


// 고아 블록, 엉클 블록
// https://jeongbincom.tistory.com/80

// 블록 채굴자의 보상
// 블록 보상(3이더) + 트랙잭션 수수료 + 엉클 블록 1개당 블록 보상의 3.125%(최대 2개)

// 엉클 블록 채굴자의 보상
// (8 - (정상 블록 번호 - 엉클 블록 번호)) / 8 * 블록 보상

// (8 - (10 - 9)) / 8 * 3


// https://medium.com/tomak/ethereum-ghost-protocol%EC%97%90-%EB%8C%80%ED%95%9C-%EC%9D%B4%ED%95%B4-56590765eb18
// https://brownbears.tistory.com/427
// https://www.koreascience.or.kr/article/JAKO201851648109450.pdf