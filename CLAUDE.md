# 프로젝트 메모리

## 용어 정의

- **champions sprites** : 포켓몬 챔피언스 게임의 메뉴 일러스트 스프라이트.
  Bulbagarden Archives에서 `Menu_CP_XXXX.png` 패턴으로 제공되며,
  MD5 해시 기반 CDN URL(`media/upload/{h[0]}/{h[:2]}/{filename}`)로 접근한다.
  코드에서는 `spark-md5`로 URL을 생성하고 실패 시 PokeAPI 스프라이트로 폴백한다.
