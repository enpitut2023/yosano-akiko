import {
  CourseId,
  FakeCourse,
  FakeCourseId,
  KnownCourse,
  RealCourse,
} from "@/akiko";
import { ClassifyOptions, SetupCreditRequirements } from "@/app-setup";
import {
  isArt,
} from "@/requirements/common";

export type Specialty = "nurse-n" | "nurse-phn" | "nurse-h";

function classifyColumnA(id: CourseId, specialty: Specialty, native: boolean): string | undefined {
  let offset_phn = 0;
  let offset_h = 0;

  臨床看護実践
  HC30141 a1 基礎看護学概論
  HC30191 a2 基本看護技術 since 2022
  HC30192 a3 基本看護技術演習 sice 2022
  HC30201 a4 フィジカルアセスメント since 2022
  HC30181 a5 看護過程 since 2022
  HC30071 a6 看護生命倫理
  if (specialty == "nurse-n" | "nurse-phn")
    HC30183 a7 看護技術実習
    HC30193 a8 看護過程実習
  else
    offset_h += 2
  HC32051 a9 臨床看護学概論
  HC32081 a10 臨床看護方法論 !!A!!
  if (specialty == "nurse-n" | "nurse-phn")
    HC32083 a11 臨床看護学実習(クリティカルケア)
    HC32093 a12 臨床看護学実習(セルフケア)
  else
    offset_h += 2

  生涯発達看護
  HC36191 a13 生涯発達と家族支援
  HC36161 a14 子どもの発達支援学概論
  HC36171 a15 子どもの発達支援方法論!!A!!2023の履修要覧にあるが、授業がリザードンにない
  if (specialty == "nurse-n" | "nurse-phn")
    HC36173 a16 子どもの発達支援実習（保育所・施設ふれあい実習）!!A!!2023の履修要覧にあるが、授業がリザードンにない
    HC36183 a17 子どもの発達支援実習（病院実習）!!A!!2023の履修要覧にあるが、授業がリザードンにない
  else
    offset_h += 2
  HC35051 a18 ウィメンズヘルス看護学概論
  HC35211 a19 ウィメンズヘルス看護学方法論!!A!!2023の履修要覧にあるが、授業がリザードンにない
  if (specialty == "nurse-n" | "nurse-phn")
    HC35043 a20 ウィメンズヘルス看護学実習!!A!!2023の履修要覧にあるが、授業がリザードンにない
  else
    offset_h += 1
  HC34001 a21 高齢者看護学概論
  HC34051 a22 高齢者看護方法論 sinse 22
  if (specialty == "nurse-n" | "nurse-phn")
    HC34083 a23 高齢者看護学実習!!A!!24.25のHC34073は2021年度以前入学生向けなのか
  else
    offset_h += 1

  地域看護実践
  HC37021 a24 地域・在宅看護論 sinse 2022 !!A!!2023の履修要覧にあるが、授業がリザードンにない
  HC37031 a25 地域・在宅看護方法論 sinse 2022 !!A!!2023の履修要覧にあるが、授業がリザードンにない
  if (specialty == "nurse-n" | "nurse-phn")
    HC37033 a26 地域・在宅看護論実習 sinse 2022 !!A!!2023の履修要覧にあるが、授業がリザードンにない
  else
    offset_h += 1
  HC31081 a27 公衆衛生看護学概論
  HC31111 a28 職域における保健活動
  HC33011 a29 精神看護学概論
  HC33061 a30 精神看護方法論 sinse 2022 !!A!!2023の履修要覧にあるが、授業がリザードンにない
  HC37041 a31 家族病理とメンタルヘルス sinse 2022
  if (specialty == "nurse-n" | "nurse-phn")
    HC33023 a32 精神看護学実習
  else
    offset_h += 1

  看護の発展
  HC40011 a33 ヘルスプロモーションと看護
  HC40041 a34 災害看護学
  HC40031 a35 看護マネジメント
  HC40051 a36 国際看護学
  if (specialty == "nurse-n" | "nurse-phn")
    HC40072 a37 応用看護学演習I(OSCE)
    HC40082 a38 応用看護学演習II(IBT)
  else
    offset_h += 2
  HC40061 a39 研究方法概論
  HC40121 a40 看護学探究概説!!A!!23生はHC40121しか取れないという認識で正しいか
  if (specialty == "nurse-n")
    HC40122 a41 看護学探究演習!!A!!23生はHC40122しか取れないという認識で正しいか
  else
    offset_phn += 1;
    offset_h += 1;
  if (specialty == "nurse-n" | "nurse-phn")
    HC40003 a42 ヘルスプロモーション実習I
    HC40013 a43 ヘルスプロモーション実習II
    HC40112 a44 医療チーム連携演習
    HC40023 a45 応用看護学実習
  else
    offset_h += 4

  保健師科目
  if (specialty == "nurse-phn")
    HC41001 a46 公衆衛生看護活動論
    HC41031 a47 公衆衛生看護活動方法論
    HC41052 a48 公衆衛生看護学応用論!!A!!23生はHC41052しか取れないという認識で正しいか
    HC41061 a49 公衆衛生看護管理論
    HC41003 a50 公衆衛生看護学実習

  ヘルスケア原理
  if (specialty == "nurse-h")
    HC90011 a46 国際ヘルスケア概論 2024は開講されない
    HC90012 a47 国際ヘルスケア演習
    HC90003 a48 ヘルスケア実習I(介護施設)
    HC90013 a49 ヘルスケア実習II(医療施設)
}

function classifyColumnC(id: CourseId): string | undefined {

}