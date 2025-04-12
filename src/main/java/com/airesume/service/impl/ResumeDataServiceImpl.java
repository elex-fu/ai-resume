package com.airesume.service.impl;

import com.airesume.vo.ResumeVO;
import com.airesume.service.ResumeDataService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 简历数据服务实现类，使用mock数据
 */
@Service
public class ResumeDataServiceImpl implements ResumeDataService {

    private final ConcurrentHashMap<Long, ResumeVO> resumeDataMap = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(1);
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 初始化服务时加载mock数据
     */
    @PostConstruct
    public void init() {
        try {
            loadMockData();
        } catch (Exception e) {
            // 如果加载失败，至少初始化一个空的简历数据
            ResumeVO emptyResume = createEmptyResume();
            resumeDataMap.put(emptyResume.getId(), emptyResume);
        }
    }

    /**
     * 从JSON文件加载mock数据
     */
    private void loadMockData() {
        try {
            ClassPathResource resource = new ClassPathResource("static/mock/resume-mock-data.json");
            InputStream is = resource.getInputStream();
            ResumeVO[] resumeVOs = objectMapper.readValue(is, ResumeVO[].class);
            
            for (ResumeVO resumeVO : resumeVOs) {
                if (resumeVO.getId() == null) {
                    resumeVO.setId(idGenerator.getAndIncrement());
                } else {
                    // 确保ID生成器值大于已有最大ID
                    idGenerator.getAndUpdate(currentId -> 
                        Math.max(currentId, resumeVO.getId() + 1));
                }
                resumeDataMap.put(resumeVO.getId(), resumeVO);
            }
        } catch (IOException e) {
            // 如果JSON文件不存在或解析失败，创建硬编码的mock数据
            createDefaultMockData();
        }
    }

    /**
     * 创建默认的mock数据
     */
    private void createDefaultMockData() {
        // 第一个简历数据
        ResumeVO resume1 = new ResumeVO();
        resume1.setId(idGenerator.getAndIncrement());
        
        // 基本信息
        ResumeVO.BasicInfo basicInfo1 = new ResumeVO.BasicInfo();
        basicInfo1.setName("张三");
        basicInfo1.setGender("男");
        basicInfo1.setAge("24岁");
        basicInfo1.setPolitical("党员");
        basicInfo1.setLocation("广州");
        basicInfo1.setEducationLevel("本科");
        basicInfo1.setExperience("1年工作经验");
        basicInfo1.setStatus("在职");
        basicInfo1.setEmail("example@email.com");
        basicInfo1.setPhone("188****8888");
        resume1.setBasic(basicInfo1);
        
        // 头像
        resume1.setAvatar("/images/default-avatar.png");
        
        // 求职意向
        ResumeVO.JobIntention intention1 = new ResumeVO.JobIntention();
        intention1.setPosition("产品经理");
        intention1.setCity("广州");
        intention1.setSalary("15k-25k");
        intention1.setEntryTime("随时到岗");
        resume1.setIntention(intention1);
        
        // 教育经历
        List<ResumeVO.Education> educationList1 = new ArrayList<>();
        ResumeVO.Education education1 = new ResumeVO.Education();
        education1.setSchool("腾讯大学·计算机");
        education1.setDegree("本科");
        education1.setEduTime("2014.9 - 2018.6");
        education1.setGpa("3.8/4.0");
        education1.setRank("前30%");
        education1.setMajor("计算机科学与技术");
        educationList1.add(education1);
        resume1.setEducation(educationList1);
        
        // 工作经历
        List<ResumeVO.WorkExperience> workList1 = new ArrayList<>();
        ResumeVO.WorkExperience work1 = new ResumeVO.WorkExperience();
        work1.setCompany("腾讯科技广州有限公司");
        work1.setPosition("产品实习生");
        work1.setDepartment("QQ邮箱产品部");
        work1.setWorkTime("2018.9 - 2020.3");
        work1.setDescription("负责版本上线后的推广工作，通过微博、博客和论坛等渠道将新功能触达用户");
        workList1.add(work1);
        resume1.setWork(workList1);
        
        // 项目经历
        List<ResumeVO.ProjectExperience> projectList1 = new ArrayList<>();
        ResumeVO.ProjectExperience project1 = new ResumeVO.ProjectExperience();
        project1.setProjectName("腾讯大学 \"最亮的明天\"暖灯行动");
        project1.setProjectRole("项目负责人");
        project1.setProjectTime("2014.9 - 2014.11");
        project1.setProjectLink("https://example.com/project");
        project1.setDescription("引导释放邮箱空间, 帮助贫困山区\n1、引导用户删除旧邮件，倡导资源节约和合理利用，将节约下来的运营成本投入公益项目，帮助贫困山区的教室改善照明环境");
        projectList1.add(project1);
        resume1.setProject(projectList1);
        
        // 校内经历
        List<ResumeVO.CampusExperience> campusList1 = new ArrayList<>();
        ResumeVO.CampusExperience campus1 = new ResumeVO.CampusExperience();
        campus1.setCampusOrg("腾讯大学产品协会");
        campus1.setCampusRole("产品研发部 副主席");
        campus1.setCampusTime("2015.3 - 2015.6");
        campus1.setCampusType("社团");
        campus1.setDescription("主导产品项目立项\n主导QQ邮箱超大附件、漂流瓶、记事本等多个产品的立项，资源协调、进度管理和对外合作工作");
        campusList1.add(campus1);
        resume1.setCampus(campusList1);
        
        // 荣誉奖项
        List<ResumeVO.Award> awardsList1 = new ArrayList<>();
        ResumeVO.Award award1 = new ResumeVO.Award();
        award1.setAwardName("腾讯大学求是杯\"腾讯文化奖\"金奖");
        award1.setAwardDate("2014.8");
        awardsList1.add(award1);
        ResumeVO.Award award2 = new ResumeVO.Award();
        award2.setAwardName("腾讯大学一等奖学金");
        award2.setAwardDate("2014.3");
        awardsList1.add(award2);
        resume1.setAwards(awardsList1);
        
        // 个人技能
        List<ResumeVO.Skill> skillsList1 = new ArrayList<>();
        ResumeVO.Skill skill1 = new ResumeVO.Skill();
        skill1.setSkillName("语言技能");
        skill1.setSkillDetail("英语CET6、粤语");
        skillsList1.add(skill1);
        ResumeVO.Skill skill2 = new ResumeVO.Skill();
        skill2.setSkillName("办公技能");
        skill2.setSkillDetail("熟练使用Office办公软件、Axure RP、Visio");
        skillsList1.add(skill2);
        resume1.setSkills(skillsList1);
        
        // 分析数据
        ResumeVO.Analysis analysis1 = new ResumeVO.Analysis();
        analysis1.setScore(85);
        List<ResumeVO.AnalysisItem> analysisItems1 = new ArrayList<>();
        ResumeVO.AnalysisItem analysisItem1 = new ResumeVO.AnalysisItem();
        analysisItem1.setTitle("内容完整度");
        analysisItem1.setScore(90);
        analysisItem1.setAdvice("简历内容较为完整，建议适当补充项目成果");
        analysisItems1.add(analysisItem1);
        ResumeVO.AnalysisItem analysisItem2 = new ResumeVO.AnalysisItem();
        analysisItem2.setTitle("专业匹配度");
        analysisItem2.setScore(75);
        analysisItem2.setAdvice("与目标岗位相关性较强，可强化核心技能展示");
        analysisItems1.add(analysisItem2);
        ResumeVO.AnalysisItem analysisItem3 = new ResumeVO.AnalysisItem();
        analysisItem3.setTitle("表达清晰度");
        analysisItem3.setScore(80);
        analysisItem3.setAdvice("表达基本清晰，部分描述可更具体量化");
        analysisItems1.add(analysisItem3);
        analysis1.setItems(analysisItems1);
        resume1.setAnalysis(analysis1);
        
        // 模板样式
        ResumeVO.Template template1 = new ResumeVO.Template();
        template1.setCurrent("standard");
        template1.setColor("#1a73e8");
        resume1.setTemplate(template1);
        
        // 将第一个简历添加到map
        resumeDataMap.put(resume1.getId(), resume1);
        
        // 第二个简历可以类似创建，这里简化处理
        ResumeVO resume2 = createSecondResume();
        resumeDataMap.put(resume2.getId(), resume2);
    }
    
    /**
     * 创建第二个示例简历
     */
    private ResumeVO createSecondResume() {
        ResumeVO resume = new ResumeVO();
        resume.setId(idGenerator.getAndIncrement());
        
        // 基本信息
        ResumeVO.BasicInfo basicInfo = new ResumeVO.BasicInfo();
        basicInfo.setName("李四");
        basicInfo.setGender("男");
        basicInfo.setAge("26岁");
        basicInfo.setPolitical("群众");
        basicInfo.setLocation("北京");
        basicInfo.setEducationLevel("硕士");
        basicInfo.setExperience("3年工作经验");
        basicInfo.setStatus("离职");
        basicInfo.setEmail("lisi@example.com");
        basicInfo.setPhone("139****7777");
        resume.setBasic(basicInfo);
        
        // 其他字段省略，可根据需要添加
        resume.setAvatar("/images/default-avatar.png");
        
        return resume;
    }
    
    /**
     * 创建空的简历对象
     */
    private ResumeVO createEmptyResume() {
        ResumeVO resume = new ResumeVO();
        resume.setId(idGenerator.getAndIncrement());
        
        // 创建基本的空对象
        resume.setBasic(new ResumeVO.BasicInfo());
        resume.setAvatar("/images/default-avatar.png");
        resume.setIntention(new ResumeVO.JobIntention());
        resume.setEducation(new ArrayList<>());
        resume.setWork(new ArrayList<>());
        resume.setProject(new ArrayList<>());
        resume.setCampus(new ArrayList<>());
        resume.setAwards(new ArrayList<>());
        resume.setSkills(new ArrayList<>());
        
        // 创建分析对象
        ResumeVO.Analysis analysis = new ResumeVO.Analysis();
        analysis.setScore(0);
        analysis.setItems(new ArrayList<>());
        resume.setAnalysis(analysis);
        
        // 创建模板对象
        ResumeVO.Template template = new ResumeVO.Template();
        template.setCurrent("standard");
        template.setColor("#1a73e8");
        resume.setTemplate(template);
        
        return resume;
    }

    @Override
    public List<ResumeVO> getAllResumeData() {
        return new ArrayList<>(resumeDataMap.values());
    }

    @Override
    public ResumeVO getResumeDataById(Long id) {
        ResumeVO resumeVO = resumeDataMap.get(id);
        if (resumeVO == null) {
            // 如果找不到指定ID的简历，返回第一个简历
            List<ResumeVO> allResumes = getAllResumeData();
            return !allResumes.isEmpty() ? allResumes.get(0) : createEmptyResume();
        }
        return resumeVO;
    }

    @Override
    public ResumeVO saveResumeData(ResumeVO resumeVO) {
        if (resumeVO.getId() == null) {
            resumeVO.setId(idGenerator.getAndIncrement());
        }
        resumeDataMap.put(resumeVO.getId(), resumeVO);
        return resumeVO;
    }
} 