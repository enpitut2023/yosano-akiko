<script lang="ts">
  import type { MergedCourse } from "$lib/akiko";
  import { syllabusUrl } from "./links";

  let {
    course,
    catalogYear,
  }: {
    course: MergedCourse;
    /** The year of the catalog; links to any other year say which. */
    catalogYear: number;
  } = $props();
</script>

<!-- Not draggable, so dragging a course row by its name moves the row -->
<a
  href={syllabusUrl(course.id, course.syllabusYear)}
  target="_blank"
  draggable="false"
  >{course.name}{course.syllabusYear !== catalogYear
    ? ` (${course.syllabusYear})`
    : ""}</a
>
