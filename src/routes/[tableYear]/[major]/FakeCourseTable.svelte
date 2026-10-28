<script lang="ts">
  import type { FakeCourse } from "$lib/akiko";

  let { courses }: { courses: FakeCourse[] } = $props();
</script>

<table>
  <thead>
    <tr class="course">
      <th class="id-name">科目</th>
      <th class="credit">単位</th>
    </tr>
  </thead>
  <tbody>
    {#each courses as c (c.id)}
      <tr class="course">
        <td class="id-name">{c.name} ({c.takenYear})</td>
        <td class="credit">{c.credit ?? "-"}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style lang="scss">
  @use "./course-table";
</style>
