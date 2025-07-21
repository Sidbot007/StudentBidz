package   com.studentbidz.site.dto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MessageResponse {
    private Long id;
    private String content;
    private String senderUsername;
    private String receiverUsername;
    private java.time.OffsetDateTime createdAt;
} 